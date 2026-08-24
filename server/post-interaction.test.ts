import { describe, expect, it } from "vitest";
import { toggleReactionSnapshot, toggleRepostSnapshot } from "../src/lib/social/post-interaction";

describe("estado local de interacciones de publicaciones", () => {
  const initial = { likes: 4, favorites: 2, reposts: 1, liked: false, favorited: true, reposted: false };

  it("actualiza un like de forma local sin depender de recargar el feed", () => {
    expect(toggleReactionSnapshot(initial, "like")).toMatchObject({ liked: true, likes: 5 });
  });

  it("mantiene los contadores no negativos al alternar favoritos y republicaciones", () => {
    const withoutFavorite = toggleReactionSnapshot({ ...initial, favorites: 0, favorited: true }, "favorite");
    expect(withoutFavorite).toMatchObject({ favorited: false, favorites: 0 });
    expect(toggleRepostSnapshot(initial)).toMatchObject({ reposted: true, reposts: 2 });
  });
});
