import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Gamepad2, Clock, BarChart3, Loader2, Flame, CalendarDays, Award, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PostWithMeta } from "@/lib/social/api";
import {
  getMyLikedPosts,
  getAggregatedPlayTime,
  getUsageStats,
  getTopGame,
  formatPlayTime,
} from "@/lib/social/history";
import { UserName } from "./UserName";
import { SegmentedControl } from "@/components/ui/segmented";
import { isFirstActivity } from "@/lib/social/activity-state";

type HistoryTab = "games" | "likes";

export function HistorySection() {
  const [tab, setTab] = useState<HistoryTab>("games");
  const [likedPosts, setLikedPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(false);

  const agg = getAggregatedPlayTime();
  const sortedGames = Array.from(agg.entries()).sort((a, b) => b[1].lastPlayed.localeCompare(a[1].lastPlayed));
  const stats = getUsageStats();
  const topGame = getTopGame("total");
  const max7 = Math.max(1, ...stats.last7.map(d => d.seconds));
  const firstActivity = isFirstActivity({ totalSeconds: stats.total.seconds, gameCount: sortedGames.length, likeCount: likedPosts.length });

  useEffect(() => {
    // Simulate loading time for the view transition
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Se cargan los likes al abrir el panel: el contador del encabezado
  // («N likes») es real desde el primer momento, no solo al entrar a la pestaña.
  // Se re-consultan al cambiar de pestaña para mantener el dato fresco.
  useEffect(() => {
    setLikesLoading(true);
    getMyLikedPosts()
      .then(setLikedPosts)
      .catch(() => {})
      .finally(() => setLikesLoading(false));
  }, [tab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <section className="border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <BarChart3 size={19} className="mt-0.5 text-primary shrink-0" />
          <div>
            <h2 className="font-display text-base font-semibold">Bitácora de juego</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Tus partidas y hallazgos, en un solo registro.</p>
          </div>
        </div>

        {firstActivity ? (
          <div className="mt-5 border-l-2 border-primary pl-4 py-1">
            <div className="font-display text-sm font-semibold">Tu primera sesión empieza aquí</div>
            <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">Cuando pruebes un juego o marques una publicación, Asternal convertirá esa actividad en una bitácora útil.</p>
            <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              Explorar juegos <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border">
              <div className="py-3 pr-3">
                <div className="text-[10px] font-mono text-muted-foreground">TIEMPO TOTAL</div>
                <div className="mt-1 font-display text-lg font-semibold tabular-nums">{formatPlayTime(stats.total.seconds)}</div>
              </div>
              <div className="px-3 py-3">
                <div className="text-[10px] font-mono text-muted-foreground">JUEGOS</div>
                <div className="mt-1 font-display text-lg font-semibold tabular-nums">{sortedGames.length}</div>
              </div>
              <div className="pl-3 py-3">
                <div className="text-[10px] font-mono text-muted-foreground">RACHA</div>
                <div className="mt-1 font-display text-lg font-semibold tabular-nums">{stats.streakDays}d</div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="min-w-0">
                <div className="mb-2 text-[10px] font-mono text-muted-foreground">ÚLTIMOS 7 DÍAS</div>
                <div className="flex items-end gap-1 h-14">
                  {stats.last7.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                      <div className="w-full rounded-sm bg-primary/75 transition-colors hover:bg-primary" style={{ height: `${Math.max(6, (d.seconds / max7) * 100)}%`, minHeight: 4 }} title={formatPlayTime(d.seconds)} />
                      <span className="text-[8px] font-mono text-muted-foreground/70 truncate w-full text-center">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {topGame && (
                <div className="border-l border-border pl-3 sm:max-w-44">
                  <div className="mb-1 text-[10px] font-mono text-muted-foreground">MÁS JUGADO</div>
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-primary shrink-0" />
                    <div className="min-w-0"><div className="text-[12px] font-medium truncate">{topGame.title}</div><div className="text-[10px] font-mono text-muted-foreground">{formatPlayTime(topGame.seconds)}</div></div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <SegmentedControl
          className="mt-5"
          value={tab}
          onChange={setTab}
          items={[{ id: "games", label: "JUEGOS", icon: <Gamepad2 size={13} /> }, { id: "likes", label: "LIKES", icon: <Heart size={13} /> }]}
        />
      </section>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "games" ? (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span className="text-xs">Cargando historial…</span>
              </div>
            ) : sortedGames.length === 0 ? (
              <div className="border-l-2 border-border pl-4 py-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Gamepad2 size={16} className="text-muted-foreground" /> Aún no hay partidas guardadas</div>
                <Link to="/" className="mt-1.5 inline-flex text-[11px] font-medium text-primary hover:text-primary/75">Explorar juegos</Link>
              </div>
            ) : (
              sortedGames.map(([gameId, data], i) => (
                <motion.div
                  key={gameId}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-border/80 last:border-b-0 overflow-hidden hover:bg-surface-2/55 transition-colors"
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Cover thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-primary/10 shrink-0 overflow-hidden grid place-items-center">
                      {data.coverUrl ? (
                        <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
                      ) : (
                        <Gamepad2 size={18} className="text-primary/40" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm font-medium truncate">{data.title}</div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} /> {formatPlayTime(data.totalSeconds)}
                        </span>
                        <span>{data.sessions} sesión{data.sessions !== 1 ? "es" : ""}</span>
                      </div>
                      <div className="mt-0.5 text-[9px] text-muted-foreground/60 font-mono">
                        Última vez: {new Date(data.lastPlayed).toLocaleDateString("es", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-20 hidden sm:block">
                      <div className="text-[9px] font-mono text-muted-foreground text-right mb-1">
                        {formatPlayTime(data.totalSeconds)}
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, (data.totalSeconds / 3600) * 50)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="likes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {likesLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span className="text-xs">Cargando likes…</span>
              </div>
            ) : likedPosts.length === 0 ? (
              <div className="border-l-2 border-border pl-4 py-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Heart size={16} className="text-muted-foreground" /> Aún no has guardado publicaciones</div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">Tus referencias favoritas aparecerán aquí.</p>
              </div>
            ) : (
              likedPosts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-border/80 last:border-b-0 overflow-hidden hover:bg-surface-2/55 transition-colors"
                >
                  <div className="flex items-start gap-3 p-3">
                    {/* Author avatar */}
                    <Link
                      to="/profile/$userId"
                      params={{ userId: p.author_id }}
                      className="w-9 h-9 rounded-full bg-primary/10 grid place-items-center overflow-hidden shrink-0"
                    >
                      <Avatar p={p.author} size={36} />
                    </Link>
                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        <UserName p={p.author} />
                        <span className="text-muted-foreground/60">·</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(p.created_at).toLocaleDateString("es")}
                        </span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2 text-muted-foreground/90">
                        {p.content.replace(/^[🎮🎨]\s*/, "").trim()}
                      </p>
                      {p.media_type === "image" && p.signed_media[0] && (
                        <img
                          src={p.signed_media[0]}
                          alt=""
                          className="mt-2 w-full h-32 object-cover rounded-xl bg-muted/30"
                        />
                      )}
                    </div>
                    <Heart size={14} className="text-rose-400 shrink-0 mt-1" fill="currentColor" />
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
