import { useState } from "react";
import { X, Gamepad2, HandCoins, Sparkles, Loader2, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { type PostWithMeta, donateOrbs, getMyOrbes } from "@/lib/social/api";
import { donationError } from "@/lib/social/orbe-donations";
import { GameCard } from "./GameCard";

const AMOUNTS = [5, 10, 25, 50, 100];

function titleOf(content: string) {
  return (content.split("\n")[0] || "Juego").replace(/^🎮\s*/, "").trim() || "Juego";
}

/** Superficie dedicada para un juego; mantiene el runtime vigente de GameCard. */
export function GamePageSection({ game, myId, isMod, onClose, onChange }: {
  game: PostWithMeta;
  myId: string | null;
  isMod: boolean;
  onClose: () => void;
  onChange: () => void;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [donating, setDonating] = useState(false);
  const title = titleOf(game.content);
  const ownGame = myId === game.author_id;

  const prepareDonation = async () => {
    if (balance === null) setBalance(await getMyOrbes());
  };

  const donate = async (amount: number) => {
    const available = balance ?? await getMyOrbes();
    setBalance(available);
    const error = donationError(amount, available);
    if (error) return toast.error(error);
    setDonating(true);
    try {
      const result = await donateOrbs(game.id, amount);
      if (!result.ok) return toast.error(result.error ?? "No se pudo completar la donación");
      setBalance(result.balance ?? available - amount);
      toast.success(`${amount} orbes enviados`, { description: `Apoyaste a @${game.author?.username ?? "el creador"}` });
      onChange();
    } catch {
      toast.error("No se pudo completar la donación");
    } finally {
      setDonating(false);
    }
  };

  return (
    <section className="fixed inset-0 z-[90] flex h-[100dvh] flex-col bg-background animate-in fade-in duration-200">
      <header className="shrink-0 border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-primary/20 bg-primary/[0.07] text-primary"><Gamepad2 size={17} /></span>
          <div className="min-w-0 flex-1"><h2 className="truncate font-display text-sm font-semibold">{title}</h2><p className="truncate text-[11px] text-muted-foreground">Por @{game.author?.username ?? "creador"}</p></div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:border-primary/30 hover:text-foreground active:scale-95" aria-label="Cerrar juego"><X size={16} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-5">
          <div className="flex items-center justify-center gap-5 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Heart size={14} className={game.my_like ? "fill-primary text-primary" : ""} />{game.likes}</span>
            <span className="inline-flex items-center gap-1.5"><MessageCircle size={14} />{game.comments_count}</span>
          </div>
          <GameCard post={game} myId={myId} isMod={isMod} onChange={onChange} />

          {myId && !ownGame && (
            <div className="border-t border-border pt-5" onMouseEnter={() => void prepareDonation()}>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/[0.07] text-primary"><HandCoins size={16} /></span>
                <div className="min-w-0 flex-1"><h3 className="font-display text-sm font-semibold">Apoya esta creación</h3><p className="mt-0.5 text-[11px] text-muted-foreground">Envía orbes directamente a su creador.</p></div>
                <button onClick={() => void prepareDonation()} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.07] px-2.5 py-1.5 text-[11px] font-mono font-semibold text-primary"><Sparkles size={11} />{balance === null ? "…" : balance}</button>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {AMOUNTS.map(amount => <button key={amount} disabled={donating || (balance !== null && amount > balance)} onClick={() => void donate(amount)} className="h-10 rounded-lg border border-primary/25 bg-primary/[0.045] text-[12px] font-display font-semibold text-primary transition hover:bg-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">{donating ? <Loader2 size={14} className="mx-auto animate-spin" /> : amount}</button>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
