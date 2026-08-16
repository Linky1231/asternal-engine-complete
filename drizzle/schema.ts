import { bigint, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Generic compatibility envelope for records imported from Supabase.
 * Original table/id values remain intact so legacy relationships can be rebuilt.
 */
export const cloudRecords = mysqlTable("cloud_records", {
  id: int("id").autoincrement().primaryKey(),
  sourceTable: varchar("sourceTable", { length: 128 }).notNull(),
  sourceId: varchar("sourceId", { length: 191 }).notNull(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }),
  payload: text("payload").notNull(),
  contentHash: varchar("contentHash", { length: 128 }).notNull(),
  sourceUpdatedAt: timestamp("sourceUpdatedAt"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  sourceRecordUnique: uniqueIndex("cloud_records_source_unique").on(table.sourceTable, table.sourceId),
  sourceTableIndex: index("cloud_records_table_idx").on(table.sourceTable),
  ownerIndex: index("cloud_records_owner_idx").on(table.ownerOpenId),
}));
export type CloudRecord = typeof cloudRecords.$inferSelect;
export type InsertCloudRecord = typeof cloudRecords.$inferInsert;

/** Metadata for files transferred from Supabase Storage into Manus storage. */
export const cloudAssets = mysqlTable("cloud_assets", {
  id: int("id").autoincrement().primaryKey(),
  sourceBucket: varchar("sourceBucket", { length: 128 }).notNull(),
  sourcePath: varchar("sourcePath", { length: 512 }).notNull(),
  manusKey: varchar("manusKey", { length: 512 }).notNull(),
  contentType: varchar("contentType", { length: 255 }),
  byteSize: bigint("byteSize", { mode: "number" }),
  contentHash: varchar("contentHash", { length: 128 }),
  sourceUpdatedAt: timestamp("sourceUpdatedAt"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
}, (table) => ({
  sourceAssetUnique: uniqueIndex("cloud_assets_source_unique").on(table.sourceBucket, table.sourcePath),
  manusKeyUnique: uniqueIndex("cloud_assets_manus_key_unique").on(table.manusKey),
}));
export type CloudAsset = typeof cloudAssets.$inferSelect;
export type InsertCloudAsset = typeof cloudAssets.$inferInsert;

/** Resumable cursor/audit record for idempotent migration and client sync. */
export const cloudSyncCursors = mysqlTable("cloud_sync_cursors", {
  id: int("id").autoincrement().primaryKey(),
  scope: varchar("scope", { length: 191 }).notNull(),
  cursor: varchar("cursor", { length: 512 }),
  status: mysqlEnum("status", ["pending", "running", "complete", "failed"]).default("pending").notNull(),
  details: text("details"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  scopeUnique: uniqueIndex("cloud_sync_scope_unique").on(table.scope),
}));
export type CloudSyncCursor = typeof cloudSyncCursors.$inferSelect;

/** Audit trail for source objects that could not be transferred. */
export const cloudMigrationSkips = mysqlTable("cloud_migration_skips", {
  id: int("id").autoincrement().primaryKey(),
  sourceBucket: varchar("sourceBucket", { length: 128 }),
  sourcePath: varchar("sourcePath", { length: 512 }),
  sourceTable: varchar("sourceTable", { length: 128 }),
  sourceId: varchar("sourceId", { length: 191 }),
  reason: text("reason").notNull(),
  details: text("details"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  skipAssetUnique: uniqueIndex("cloud_migration_skip_asset_unique").on(table.sourceBucket, table.sourcePath),
  skipRecordUnique: uniqueIndex("cloud_migration_skip_record_unique").on(table.sourceTable, table.sourceId),
}));
export type CloudMigrationSkip = typeof cloudMigrationSkips.$inferSelect;

// TODO: Add feature queries here
