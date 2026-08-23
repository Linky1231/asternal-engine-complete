/**
 * Contrato visual compartido para acciones sociales.
 * Una selección se confirma con el azul de marca; el reposo permanece neutro.
 */
export function socialActionStateClass(active: boolean): string {
  return active
    ? "border-primary/35 bg-primary/15 text-primary shadow-sm"
    : "border-transparent bg-transparent text-muted-foreground pointer-fine:hover:bg-muted/50 pointer-fine:hover:text-foreground";
}

/** Acciones de Perfil: el azul se reserva para el panel que ya está abierto. */
export function profileControlStateClass(active: boolean): string {
  return active
    ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
    : "border-border bg-surface text-foreground hover:bg-muted/60";
}

/** Actualiza el estado de seguimiento en pantalla antes de que termine la petición. */
export function optimisticFollowStats<T extends { followers: number; i_follow: boolean }>(
  current: T,
  willFollow: boolean,
): T {
  if (current.i_follow === willFollow) return current;

  return {
    ...current,
    followers: Math.max(0, current.followers + (willFollow ? 1 : -1)),
    i_follow: willFollow,
  };
}

export type FooterActionSelection = "like" | "favorite" | "comments" | "repost" | null;

/** Las acciones rápidas comparten un único foco visual dentro de cada publicación. */
export function nextExclusiveFooterAction(
  current: FooterActionSelection,
  next: Exclude<FooterActionSelection, null>,
): FooterActionSelection {
  return current === next ? null : next;
}
