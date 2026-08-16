import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const sourceUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const sourceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;
const forgeUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
const dryRun = process.argv.includes("--dry-run");
const migrateAssets = process.argv.includes("--assets");
const pageSize = 500;

if (!sourceUrl || !sourceKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
if (!dryRun && (!databaseUrl || !forgeUrl || !forgeKey)) {
  throw new Error("DATABASE_URL, BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY are required for the write phase");
}

const sourceHeaders = {
  apikey: sourceKey,
  Authorization: `Bearer ${sourceKey}`,
};

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function parseTableNames(sql) {
  return [...sql.matchAll(/create table if not exists public\.([a-zA-Z0-9_]+)/g)].map((match) => match[1]);
}

async function sourceFetch(url, init = {}) {
  const response = await fetch(url, { ...init, headers: { ...sourceHeaders, ...(init.headers || {}) }, signal: init.signal || AbortSignal.timeout(30_000) });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase request failed (${response.status}) ${url}: ${body.slice(0, 300)}`);
  }
  return response;
}

async function fetchRows(table) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const url = new URL(`${sourceUrl}/rest/v1/${table}`);
    url.searchParams.set("select", "*");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("offset", String(offset));
    let response;
    try {
      response = await sourceFetch(url);
    } catch (error) {
      if (String(error).includes("PGRST205") || String(error).includes("Could not find the table")) {
        return { rows: [], missing: true };
      }
      throw error;
    }
    const page = await response.json();
    rows.push(...page);
    if (page.length < pageSize) return { rows, missing: false };
  }
}

async function fetchAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const url = new URL(`${sourceUrl}/auth/v1/admin/users`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(pageSize));
    const response = await sourceFetch(url);
    const payload = await response.json();
    const pageUsers = Array.isArray(payload) ? payload : payload.users || [];
    users.push(...pageUsers);
    if (pageUsers.length < pageSize) return users;
  }
}

async function listStorageObjects(bucket) {
  const objects = [];
  for (let offset = 0; ; offset += pageSize) {
    const response = await sourceFetch(`${sourceUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: pageSize, offset, sortBy: { column: "name", order: "asc" } }),
    });
    const page = await response.json();
    objects.push(...page.filter((object) => object.name));
    if (page.length < pageSize) return objects;
  }
}

async function uploadToManus(key, bytes, contentType) {
  const presignUrl = new URL("v1/storage/presign/put", `${forgeUrl}/`);
  presignUrl.searchParams.set("path", key);
  const presign = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` }, signal: AbortSignal.timeout(30_000) });
  if (!presign.ok) throw new Error(`Manus presign failed (${presign.status})`);
  const { url } = await presign.json();
  const upload = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType || "application/octet-stream" }, body: bytes, signal: AbortSignal.timeout(10_000) });
  if (!upload.ok) throw new Error(`Manus upload failed (${upload.status}) for ${key}`);
}

async function main() {
  const schemaPath = path.resolve("supabase-setup.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");
  const tables = parseTableNames(schemaSql);
  const tableSummary = [];
  const records = [];

  for (const table of tables) {
    const result = await fetchRows(table);
    tableSummary.push({ table, rows: result.rows.length, missing: result.missing || undefined });
    for (const row of result.rows) {
      const payload = JSON.stringify(row);
      records.push({
        sourceTable: `public.${table}`,
        sourceId: String(row.id ?? row.user_id ?? crypto.createHash("sha1").update(payload).digest("hex")),
        ownerOpenId: row.user_id ? String(row.user_id) : row.author_id ? String(row.author_id) : null,
        payload,
        contentHash: sha256(payload),
        sourceUpdatedAt: row.updated_at ? new Date(row.updated_at) : null,
      });
    }
  }

  const authUsers = await fetchAuthUsers();
  tableSummary.push({ table: "auth.users", rows: authUsers.length });
  for (const user of authUsers) {
    const payload = JSON.stringify(user);
    records.push({ sourceTable: "auth.users", sourceId: String(user.id), ownerOpenId: null, payload, contentHash: sha256(payload), sourceUpdatedAt: user.updated_at ? new Date(user.updated_at) : null });
  }

  const bucketsResponse = await sourceFetch(`${sourceUrl}/storage/v1/bucket`);
  const buckets = await bucketsResponse.json();
  const assets = [];
  const skippedAssets = [];
  for (const bucket of buckets) {
    const objects = await listStorageObjects(bucket.name);
    tableSummary.push({ table: `storage.${bucket.name}`, rows: objects.length });
    for (const object of objects) {
      assets.push({ bucket: bucket.name, path: object.name, size: object.metadata?.size ? Number(object.metadata.size) : null, contentType: object.metadata?.mimetype || null, updatedAt: object.updated_at ? new Date(object.updated_at) : null });
    }
  }

  console.log(JSON.stringify({ dryRun, tables: tableSummary, records: records.length, assets: assets.length, skippedAssets }, null, 2));
  if (dryRun) return;

  const connection = await mysql.createConnection(databaseUrl);
  try {
    for (let batchStart = 0; batchStart < records.length; batchStart += 100) {
      const batch = records.slice(batchStart, batchStart + 100);
      const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)").join(",");
      const params = batch.flatMap((record) => [record.sourceTable, record.sourceId, record.ownerOpenId, record.payload, record.contentHash, record.sourceUpdatedAt]);
      await connection.execute(
        `INSERT INTO cloud_records (sourceTable, sourceId, ownerOpenId, payload, contentHash, sourceUpdatedAt, syncedAt) VALUES ${placeholders} ON DUPLICATE KEY UPDATE ownerOpenId=VALUES(ownerOpenId), payload=VALUES(payload), contentHash=VALUES(contentHash), sourceUpdatedAt=VALUES(sourceUpdatedAt), syncedAt=CURRENT_TIMESTAMP`,
        params,
      );
      console.log(`Migrated records ${Math.min(batchStart + batch.length, records.length)}/${records.length}`);
    }

    if (!migrateAssets) {
      for (const asset of assets) skippedAssets.push({ bucket: asset.bucket, path: asset.path, reason: "asset transfer requires explicit --assets phase" });
    }
    for (const asset of migrateAssets ? assets : []) {
      let response;
      try {
        response = await sourceFetch(`${sourceUrl}/storage/v1/object/${encodeURIComponent(asset.bucket)}/${asset.path}`, { signal: AbortSignal.timeout(5_000) });
      } catch (error) {
        if (String(error).includes("NoSuchKey") || String(error).includes("not_found") || String(error).includes("aborted") || String(error).includes("AbortError")) {
          skippedAssets.push({ bucket: asset.bucket, path: asset.path, reason: "source object missing" });
          continue;
        }
        throw error;
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      const contentHash = sha256(bytes);
      const manusKey = `migrated/${asset.bucket}/${asset.path}`;
      try {
        await uploadToManus(manusKey, bytes, asset.contentType || response.headers.get("content-type") || "application/octet-stream");
      } catch (error) {
        skippedAssets.push({ bucket: asset.bucket, path: asset.path, reason: `Manus upload failed: ${String(error).slice(0, 160)}` });
        continue;
      }
      await connection.execute(
        `INSERT INTO cloud_assets (sourceBucket, sourcePath, manusKey, contentType, byteSize, contentHash, sourceUpdatedAt, syncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE manusKey=VALUES(manusKey), contentType=VALUES(contentType), byteSize=VALUES(byteSize), contentHash=VALUES(contentHash), sourceUpdatedAt=VALUES(sourceUpdatedAt), syncedAt=CURRENT_TIMESTAMP`,
        [asset.bucket, asset.path, manusKey, asset.contentType, bytes.length, contentHash, asset.updatedAt],
      );
      console.log(`Migrated asset ${asset.bucket}/${asset.path}`);
    }
    console.log(JSON.stringify({ completed: true, migratedRecords: records.length, migratedAssets: migrateAssets ? assets.length - skippedAssets.length : 0, skippedAssets }, null, 2));
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
