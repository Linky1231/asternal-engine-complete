import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  CloudAsset,
  CloudRecord,
  InsertCloudAsset,
  InsertCloudRecord,
  cloudAssets,
  cloudRecords,
  cloudSyncCursors,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}


export async function upsertCloudRecord(record: InsertCloudRecord): Promise<CloudRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(cloudRecords).values(record).onDuplicateKeyUpdate({
    set: {
      ownerOpenId: record.ownerOpenId ?? null,
      payload: record.payload,
      contentHash: record.contentHash,
      sourceUpdatedAt: record.sourceUpdatedAt ?? null,
      syncedAt: new Date(),
      deletedAt: record.deletedAt ?? null,
    },
  });
  const rows = await db.select().from(cloudRecords)
    .where(eq(cloudRecords.sourceTable, record.sourceTable));
  return rows.find((row) => row.sourceId === record.sourceId);
}

export async function listCloudRecords(sourceTable: string, ownerOpenId?: string) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(cloudRecords).where(eq(cloudRecords.sourceTable, sourceTable));
  return ownerOpenId ? rows.filter((row) => row.ownerOpenId === ownerOpenId) : rows;
}

export async function upsertCloudAsset(asset: InsertCloudAsset): Promise<CloudAsset | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(cloudAssets).values(asset).onDuplicateKeyUpdate({
    set: {
      manusKey: asset.manusKey,
      contentType: asset.contentType ?? null,
      byteSize: asset.byteSize ?? null,
      contentHash: asset.contentHash ?? null,
      sourceUpdatedAt: asset.sourceUpdatedAt ?? null,
      syncedAt: new Date(),
    },
  });
  const rows = await db.select().from(cloudAssets).where(eq(cloudAssets.sourceBucket, asset.sourceBucket));
  return rows.find((row) => row.sourcePath === asset.sourcePath);
}

export async function saveCloudSyncCursor(scope: string, cursor: string | null, status: "pending" | "running" | "complete" | "failed", details?: unknown) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(cloudSyncCursors).values({
    scope,
    cursor,
    status,
    details: details === undefined ? null : JSON.stringify(details),
  }).onDuplicateKeyUpdate({
    set: {
      cursor,
      status,
      details: details === undefined ? null : JSON.stringify(details),
      updatedAt: new Date(),
    },
  });
  const rows = await db.select().from(cloudSyncCursors).where(eq(cloudSyncCursors.scope, scope));
  return rows[0];
}

export async function getCloudSyncCursor(scope: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(cloudSyncCursors).where(eq(cloudSyncCursors.scope, scope)).limit(1);
  return rows[0];
}

