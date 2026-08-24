export type PostInteractionSnapshot = {
  likes: number;
  favorites: number;
  reposts: number;
  liked: boolean;
  favorited: boolean;
  reposted: boolean;
};

export function toggleReactionSnapshot(
  snapshot: PostInteractionSnapshot,
  type: "like" | "favorite",
): PostInteractionSnapshot {
  const activeKey = type === "like" ? "liked" : "favorited";
  const countKey = type === "like" ? "likes" : "favorites";
  const nextActive = !snapshot[activeKey];

  return {
    ...snapshot,
    [activeKey]: nextActive,
    [countKey]: Math.max(0, snapshot[countKey] + (nextActive ? 1 : -1)),
  };
}

export function toggleRepostSnapshot(snapshot: PostInteractionSnapshot): PostInteractionSnapshot {
  const reposted = !snapshot.reposted;
  return {
    ...snapshot,
    reposted,
    reposts: Math.max(0, snapshot.reposts + (reposted ? 1 : -1)),
  };
}
