export type PostSurfaceKind = "game" | "poll" | "html" | "locked";

const POST_SURFACES: Record<PostSurfaceKind, string> = {
  game: "border border-primary/25 bg-primary/[0.055] shadow-[0_10px_28px_rgba(36,120,190,0.08)]",
  poll: "border border-primary/20 bg-primary/[0.035]",
  html: "border border-primary/20 bg-primary/[0.025]",
  locked: "border border-primary/20 bg-primary/[0.035]",
};

/**
 * Las piezas informativas del post usan capas Azure Drift suaves. Los controles
 * siguen definiendo su propio estado para no convertir elementos inactivos en botones.
 */
export function postSurfaceClass(kind: PostSurfaceKind): string {
  return POST_SURFACES[kind];
}
