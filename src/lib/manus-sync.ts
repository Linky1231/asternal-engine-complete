export type ManusSyncRecord = {
  sourceTable: string;
  sourceId: string;
  payload: unknown;
  sourceUpdatedAt?: string;
};

type QueuedRecord = ManusSyncRecord & { attempts: number };
const QUEUE_KEY = "_manus_sync_queue";

function readQueue(): QueuedRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeQueue(queue: QueuedRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-100)));
  localStorage.setItem("_manus_sync_pending", String(queue.length));
}

async function postRecord(record: ManusSyncRecord): Promise<boolean> {
  const response = await fetch("/api/manus/sync", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(record),
  });
  return response.ok;
}

export async function syncManusRecord(record: ManusSyncRecord): Promise<boolean> {
  try {
    const ok = await postRecord(record);
    if (ok) return true;
  } catch { /* offline or not authenticated yet */ }
  const queue = readQueue().filter(item => !(item.sourceTable === record.sourceTable && item.sourceId === record.sourceId));
  queue.push({ ...record, attempts: 0 });
  writeQueue(queue);
  return false;
}

export async function flushManusSyncQueue(): Promise<{ synced: number; pending: number }> {
  const queue = readQueue();
  if (!queue.length) return { synced: 0, pending: 0 };
  const pending: QueuedRecord[] = [];
  let synced = 0;
  for (const item of queue) {
    try {
      if (await postRecord(item)) { synced++; continue; }
    } catch { /* retry below */ }
    pending.push({ ...item, attempts: item.attempts + 1 });
  }
  writeQueue(pending);
  return { synced, pending: pending.length };
}

export async function listManusRecords(sourceTable: string): Promise<Array<{ id: string; name: string; data: unknown; updated_at: string }>> {
  const response = await fetch(`/api/manus/sync?sourceTable=${encodeURIComponent(sourceTable)}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("No se pudieron cargar los datos sincronizados en Manus");
  return response.json();
}

export function initManusSync(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onRequest = () => { void flushManusSyncQueue(); };
  window.addEventListener("manus:sync-requested", onRequest);
  window.addEventListener("online", onRequest);
  void flushManusSyncQueue();
  return () => {
    window.removeEventListener("manus:sync-requested", onRequest);
    window.removeEventListener("online", onRequest);
  };
}
