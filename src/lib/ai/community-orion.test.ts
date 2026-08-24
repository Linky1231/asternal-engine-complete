import { preserveAllRankedPosts, rankingCacheKey } from "./community-orion";
import { describe, expect, it } from "vitest";

describe("caché de recomendación de Orión", () => {
  it("diferencia la recomendación cuando cambia una cuenta seguida", () => {
    const posts = [{ id: "post-a" }, { id: "post-b" }];
    expect(rankingCacheKey(posts, ["autor-a"])).not.toBe(rankingCacheKey(posts, ["autor-b"]));
  });

  it("mantiene una clave estable aunque cambie el orden de las cuentas seguidas", () => {
    const posts = [{ id: "post-a" }];
    expect(rankingCacheKey(posts, ["autor-b", "autor-a"])).toBe(rankingCacheKey(posts, ["autor-a", "autor-b"]));
  });

  it("conserva cada publicación cuando Orión devuelve una recomendación parcial", () => {
    const posts = [{ id: "post-a" }, { id: "post-b" }, { id: "post-c" }] as never[];
    const result = preserveAllRankedPosts(posts, ["post-b", "desconocida", "post-b"]);

    expect(result.map(post => post.id)).toEqual(["post-b", "post-a", "post-c"]);
    expect(new Set(result.map(post => post.id)).size).toBe(posts.length);
  });
});
