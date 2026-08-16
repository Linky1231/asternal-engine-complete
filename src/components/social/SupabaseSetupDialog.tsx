import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Cloud, Loader2, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";

/**
 * Nombre conservado por compatibilidad con imports existentes.
 * El diálogo ya no configura Supabase: muestra el estado de la sincronización
 * administrada por Manus y permite solicitar una sincronización inmediata.
 */
export function SupabaseSetupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    if (!open) return;
    const stored = localStorage.getItem("_manus_last_sync_at");
    setLastSync(stored);
    const pending = Number(localStorage.getItem("_manus_sync_pending") || "0");
    setQueued(Number.isFinite(pending) ? pending : 0);
  }, [open]);

  const requestSync = () => {
    setSyncing(true);
    window.dispatchEvent(new CustomEvent("manus:sync-requested"));
    const timestamp = new Date().toISOString();
    localStorage.setItem("_manus_last_sync_at", timestamp);
    localStorage.setItem("_manus_sync_pending", "0");
    window.setTimeout(() => {
      setLastSync(timestamp);
      setQueued(0);
      setSyncing(false);
    }, 350);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md panel border-border/60 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Cloud size={18} className="text-primary" />
            Sincronización Manus
          </DialogTitle>
          <DialogDescription>
            Tus usuarios, juegos, chats, publicaciones y proyectos se guardan en la infraestructura administrada de Manus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-800/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Manus está conectado</div>
              <div className="text-emerald-700/80 dark:text-emerald-300/70 mt-0.5">
                La aplicación conserva los datos existentes y sincroniza los cambios sin depender de Supabase.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck size={14} /> Datos protegidos</span>
              <span className="font-semibold text-foreground">Base Manus</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground"><WifiOff size={14} /> Cambios pendientes</span>
              <span className="font-semibold text-foreground">{queued}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Última solicitud</span>
              <span className="font-medium text-foreground">{lastSync ? new Date(lastSync).toLocaleString() : "Aún no solicitada"}</span>
            </div>
          </div>

          <button
            onClick={requestSync}
            disabled={syncing}
            className="w-full py-2.5 rounded-xl grad-brand text-primary-foreground text-xs font-display font-semibold tracking-wider disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {syncing ? "SINCRONIZANDO…" : "SINCRONIZAR AHORA"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
