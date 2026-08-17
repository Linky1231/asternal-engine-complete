import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createHash } from "node:crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerGoogleOAuthRoutes } from "./googleOAuth";
import { getSessionCookieOptions } from "./cookies";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { listCloudRecords, upsertCloudRecord } from "../db";
import { sdk } from "./sdk";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  // Production runs behind Manus's HTTPS reverse proxy. Trust the first hop so
  // req.protocol and secure cookie handling reflect the public request scheme.
  app.set("trust proxy", 1);
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerGoogleOAuthRoutes(app);

  // Compatibility bridge for the legacy Asternal frontend. The active UI still
  // consumes a Supabase-shaped session object, so expose the server session through
  // a small same-origin endpoint instead of leaking or parsing the JWT in React.
  app.get("/api/auth/session", async (req, res) => {
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user) return res.json({ session: null });
    return res.json({
      session: {
        user: { id: user.openId, email: user.email ?? null },
        access_token: "asternal-cookie-session",
        expires_at: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
      },
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("app_session_id", getSessionCookieOptions(req));
    return res.json({ ok: true });
  });

  // Manus sync bridge. It stores only the authenticated user's records in the
  // generic cloud envelope, preserving legacy ids and payloads.
  app.get("/api/manus/sync", async (req, res) => {
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user) return res.status(401).json({ error: "Authentication required" });
    const sourceTable = String(req.query.sourceTable || "").trim();
    if (!sourceTable) return res.status(400).json({ error: "sourceTable is required" });
    const rows = await listCloudRecords(sourceTable, user.openId);
    return res.json(rows.map(row => ({
      id: row.sourceId,
      name: (() => { try { return JSON.parse(row.payload)?.name || row.sourceId; } catch { return row.sourceId; } })(),
      data: (() => { try { return JSON.parse(row.payload)?.data ?? JSON.parse(row.payload); } catch { return null; } })(),
      updated_at: row.syncedAt,
    })));
  });

  app.post("/api/manus/sync", async (req, res) => {
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user) return res.status(401).json({ error: "Authentication required" });
    const { sourceTable, sourceId, payload, sourceUpdatedAt } = req.body ?? {};
    if (!sourceTable || !sourceId || payload === undefined) {
      return res.status(400).json({ error: "sourceTable, sourceId and payload are required" });
    }
    const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
    const contentHash = createHash("sha256").update(serialized).digest("hex");
    const row = await upsertCloudRecord({
      sourceTable: String(sourceTable).slice(0, 128),
      sourceId: String(sourceId).slice(0, 191),
      ownerOpenId: user.openId,
      payload: serialized,
      contentHash,
      sourceUpdatedAt: sourceUpdatedAt ? new Date(sourceUpdatedAt) : null,
    });
    return res.json({ ok: true, id: row?.sourceId ?? String(sourceId), contentHash });
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
