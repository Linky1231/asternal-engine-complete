/**
 * Fachada legacy para la migración a Manus.
 *
 * El nombre del archivo se conserva para no romper imports antiguos, pero ya no
 * contiene SDK, tokens, SQL ni llamadas a Supabase. El esquema y la sincronización
 * se administran en Manus mediante Drizzle, tRPC y el endpoint Manus Sync.
 */

export const SUPABASE_ACCESS_TOKEN: undefined = undefined;

export type SetupResult = { ok: boolean; message: string };

const MANUS_MESSAGE = "La persistencia y el esquema se administran automáticamente en Manus.";

export function getSchemaSql(): string {
  return "-- El esquema se administra en Manus. No es necesario ejecutar SQL de Supabase.\n";
}

export function getSchemaSqlBlocks(): { title: string; sql: string }[] {
  return [{ title: "Manus · esquema administrado", sql: getSchemaSql() }];
}

export function sqlEditorUrl(_url: string): null {
  return null;
}

/** Conservado por compatibilidad; la aplicación ya no necesita configuración Supabase. */
export function hasSupabaseConfig(): boolean {
  return false;
}

export function projectRefFromUrl(_url: string): null {
  return null;
}

/** El backend Manus contiene las tablas gestionadas por la aplicación. */
export async function checkSchemaReady(): Promise<boolean> {
  return true;
}

export const GAME_PLAYS_SCHEMA_SQL = getSchemaSql();

export async function runSchemaSetup(_legacyToken?: string): Promise<SetupResult> {
  return { ok: true, message: MANUS_MESSAGE };
}

export async function runChatSchemaSetup(_legacyToken?: string): Promise<SetupResult> {
  return { ok: true, message: MANUS_MESSAGE };
}

export async function runGamePlaysSchemaSetup(_legacyToken?: string): Promise<SetupResult> {
  return { ok: true, message: MANUS_MESSAGE };
}
