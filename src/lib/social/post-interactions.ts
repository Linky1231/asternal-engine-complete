export type PostInteraction = "like" | "favorite" | "repost";

export type PostInteractionOverrides = Partial<Record<PostInteraction, boolean>>;

export function resolvePostInteraction(serverValue: boolean, override: boolean | undefined) {
  return override ?? serverValue;
}

export function resolvePostInteractionCount(serverCount: number, serverValue: boolean, effectiveValue: boolean) {
  if (serverValue === effectiveValue) return serverCount;
  return Math.max(0, serverCount + (effectiveValue ? 1 : -1));
}

export function getPostActionAttributes(kind: PostInteraction | "comments", active: boolean) {
  const state = active ? "active" : "inactive";

  return kind === "comments"
    ? { "data-state": state, "aria-expanded": active }
    : { "data-state": state, "aria-pressed": active };
}
