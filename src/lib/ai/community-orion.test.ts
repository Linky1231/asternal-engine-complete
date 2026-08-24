import { rankingCacheKey } from "./community-orion";
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
});
