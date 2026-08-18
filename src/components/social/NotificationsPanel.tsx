import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "./Avatar";
import { Link } from "@tanstack/react-router";
import {
  AtSign, Bell, CheckCheck, ChevronRight, Gamepad2, Heart, Inbox, Loader2,
  MessageSquare, Repeat, Reply, Sparkles, Star, UserPlus, X,
} from "lucide-react";
import { fetchAllNotifications, markNotificationsRead, type Profile } from "@/lib/social/api";
import { groupNotificationsByRecency } from "@/lib/social/notifications-view";

type Notif = {
  id: string;
  type: string;
  created_at: string;
  read: boolean;
  actor_id?: string | null;
  actor?: Profile | null;
  post_id?: string | null;
  comment_id?: string | null;
};

type Cat = "todas" | "interacciones" | "seguidores" | "juegos";

const TYPE_META: Record<string, {
  icon: typeof Heart;
  label: string;
  shortLabel: string;
  cat: Exclude<Cat, "todas">;
}> = {
  comment: { icon: MessageSquare, label: "comentó tu publicación", shortLabel: "Comentario", cat: "interacciones" },
  reply: { icon: Reply, label: "respondió a tu comentario", shortLabel: "Respuesta", cat: "interacciones" },
  reaction: { icon: Heart, label: "reaccionó a tu contenido", shortLabel: "Reacción", cat: "interacciones" },
  like: { icon: Heart, label: "indicó que le gusta tu contenido", shortLabel: "Me gusta", cat: "interacciones" },
  favorite: { icon: Star, label: "guardó tu contenido", shortLabel: "Favorito", cat: "interacciones" },
  repost: { icon: Repeat, label: "reposteó tu publicación", shortLabel: "Repost", cat: "interacciones" },
  mention: { icon: AtSign, label: "te mencionó", shortLabel: "Mención", cat: "interacciones" },
  follow: { icon: UserPlus, label: "empezó a seguirte", shortLabel: "Nuevo seguidor", cat: "seguidores" },
  game: { icon: Gamepad2, label: "publicó un juego", shortLabel: "Juego", cat: "juegos" },
};

const CATS: { id: Cat; label: string; icon: typeof Heart }[] = [
  { id: "todas", label: "Todas", icon: Inbox },
  { id: "interacciones", label: "Actividad", icon: Heart },
  { id: "seguidores", label: "Seguidores", icon: UserPlus },
  { id: "juegos", label: "Juegos", icon: Gamepad2 },
];

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "Ahora";
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
  return `Hace ${Math.floor(seconds / 86400)} d`;
}

function categoryOf(type: string): Exclude<Cat, "todas"> {
  return TYPE_META[type]?.cat ?? "interacciones";
}

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<Cat>("todas");
  const [marking, setMarking] = useState(false);

  const reload = async () => {
    try {
      setItems((await fetchAllNotifications()) as Notif[]);
    } catch {
      // En modo local o sin conexión, la bandeja permanece disponible con estado vacío.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    const interval = window.setInterval(() => void reload(), 45000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const unread = items.filter(item => !item.read).length;
  const filtered = useMemo(
    () => cat === "todas" ? items : items.filter(item => categoryOf(item.type) === cat),
    [cat, items],
  );
  const groups = useMemo(() => groupNotificationsByRecency(filtered), [filtered]);
  const categoryCount = (id: Cat) => id === "todas" ? items.length : items.filter(item => categoryOf(item.type) === id).length;

  const markAll = async () => {
    setMarking(true);
    try {
      await markNotificationsRead();
      await reload();
    } finally {
      setMarking(false);
    }
  };

  const panel = (
    <div className="fixed inset-0 z-[1000] isolate overflow-y-auto overscroll-contain bg-background text-foreground" role="dialog" aria-modal="true" aria-label="Panel de notificaciones">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
        <div className="absolute -top-24 left-[18%] h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -top-32 right-[12%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="relative min-h-full">
        <div className="h-[3px] grad-brand" />
        <header className="sticky top-0 z-20 border-b border-border/65 bg-background/88 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
            <button
              onClick={onClose}
              aria-label="Cerrar notificaciones"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-card/90 text-ink-2 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary active:scale-95"
            >
              <X size={17} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-primary">Centro de actividad</p>
              <h1 className="truncate font-display text-base font-semibold tracking-tight">Notificaciones</h1>
            </div>
            {unread > 0 && (
              <button
                onClick={() => void markAll()}
                disabled={marking}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/8 px-3 text-[10px] font-display font-semibold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-[0.97] disabled:opacity-60"
              >
                {marking ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                <span className="hidden sm:inline">Marcar leídas</span><span className="sm:hidden">Leídas</span>
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-5 sm:px-6 sm:pt-7">
          <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/85 p-5 shadow-[0_18px_50px_-28px_rgba(27,103,210,0.55)] sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 grad-brand" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl grad-brand text-primary-foreground shadow-lg shadow-primary/20">
                <Bell size={23} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tu bandeja</p>
                <h2 className="mt-0.5 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {loading ? "Actualizando actividad…" : unread > 0 ? `${unread} novedad${unread !== 1 ? "es" : ""} para ti` : "Todo está al día"}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {loading ? "Recopilamos interacciones recientes." : unread > 0 ? "Revisa lo nuevo y retoma la conversación donde la dejaste." : "No tienes actividad pendiente por revisar."}
                </p>
              </div>
              <div className="hidden rounded-2xl border border-border/60 bg-background/65 px-4 py-2 text-right sm:block">
                <div className="font-display text-lg font-semibold tabular-nums">{items.length}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Total</div>
              </div>
            </div>
          </section>

          <section className="mt-5" aria-label="Filtrar notificaciones">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ver actividad</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" role="tablist" aria-label="Categorías de notificaciones">
              {CATS.map(category => {
                const active = category.id === cat;
                const Icon = category.icon;
                const count = categoryCount(category.id);
                return (
                  <button
                    key={category.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCat(category.id)}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-display font-medium transition active:scale-[0.97] ${
                      active ? "border-transparent grad-brand text-primary-foreground shadow-md shadow-primary/15" : "border-border/65 bg-card/75 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <Icon size={14} />
                    {category.label}
                    {count > 0 && <span className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] ${active ? "bg-white/18" : "bg-muted text-muted-foreground"}`}>{count}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-5" aria-live="polite">
            {loading && items.length === 0 ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map(index => <div key={index} className="h-[88px] rounded-2xl anim-shimmer" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-card/65 px-6 py-14 text-center shadow-sm">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Inbox size={21} /></div>
                <h2 className="mt-4 font-display text-base font-semibold">Tu bandeja está tranquila</h2>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  {cat === "todas" ? "Cuando alguien interactúe contigo, aparecerá aquí." : "No hay actividad de esta categoría por ahora."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {groups.map(group => (
                  <section key={group.label}>
                    <div className="mb-2.5 flex items-center gap-3 px-1">
                      <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{group.label}</h2>
                      <div className="h-px flex-1 bg-border/60" />
                      <span className="font-mono text-[10px] text-muted-foreground/70">{group.items.length}</span>
                    </div>
                    <ul className="space-y-2.5">
                      {group.items.map(notification => {
                        const meta = TYPE_META[notification.type] ?? TYPE_META.comment;
                        const Icon = meta.icon;
                        const unseen = !notification.read;
                        const actorName = notification.actor?.display_name ?? notification.actor?.username ?? "Alguien";
                        return (
                          <li key={notification.id}>
                            <Link
                              to="/profile/$userId"
                              params={{ userId: notification.actor_id ?? "" }}
                              onClick={event => { if (!notification.actor_id) event.preventDefault(); }}
                              className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3.5 transition duration-200 ${
                                unseen ? "border-primary/25 bg-primary/[0.055] shadow-[0_12px_28px_-22px_rgba(27,103,210,0.58)] hover:border-primary/45 hover:bg-primary/[0.085]" : "border-border/65 bg-card/75 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card"
                              }`}
                            >
                              {unseen && <span className="absolute inset-y-3 left-0 w-1 rounded-r-full grad-brand" aria-hidden="true" />}
                              <div className="relative ml-1 shrink-0">
                                <Avatar p={notification.actor} size={42} />
                                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card grad-brand text-primary-foreground shadow-sm">
                                  <Icon size={10} strokeWidth={2.6} />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate font-display text-[13px] font-semibold text-foreground group-hover:text-primary">{actorName}</span>
                                  {unseen && <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wide text-primary">Nuevo</span>}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta.label}</p>
                                <div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wide text-muted-foreground/70">
                                  <span>{meta.shortLabel}</span><span className="h-1 w-1 rounded-full bg-border" /><span>{timeAgo(notification.created_at)}</span>
                                </div>
                              </div>
                              <ChevronRight size={16} className="shrink-0 text-muted-foreground/45 transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </section>

          {!loading && items.length > 0 && unread === 0 && (
            <div className="mt-7 flex items-center justify-center gap-2 pb-2 text-xs text-muted-foreground">
              <Sparkles size={14} className="text-primary" /> Todo revisado por ahora
            </div>
          )}
        </main>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
