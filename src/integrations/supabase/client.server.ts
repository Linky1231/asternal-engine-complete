// Compatibilidad retroactiva para imports server-side antiguos.
// La persistencia administrada usa Manus/Drizzle; no se inicializa Supabase.

import { listCloudRecords, upsertCloudRecord } from "../../../server/db";

export const supabaseAdmin = {
  cloud: {
    listRecords: listCloudRecords,
    upsertRecord: upsertCloudRecord,
  },
};
