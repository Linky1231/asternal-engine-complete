import { describe, expect, it } from "vitest";
import {
  getPostActionAttributes,
  resolvePostInteraction,
  resolvePostInteractionCount,
} from "../src/lib/social/post-interactions";

describe("estados de interacción de publicaciones", () => {
  it("prioriza un cambio local para que una reacción se active y desactive de inmediato", () => {
    expect(resolvePostInteraction(false, true)).toBe(true);
    expect(resolvePostInteraction(true, false)).toBe(false);
    expect(resolvePostInteraction(true, undefined)).toBe(true);
  });

  it("ajusta el contador de forma reversible sin permitir valores negativos", () => {
    expect(resolvePostInteractionCount(8, false, true)).toBe(9);
    expect(resolvePostInteractionCount(8, true, false)).toBe(7);
    expect(resolvePostInteractionCount(0, true, false)).toBe(0);
  });

  it("expone el estado correcto para lectores de pantalla", () => {
    expect(getPostActionAttributes("like", true)).toEqual({ "data-state": "active", "aria-pressed": true });
    expect(getPostActionAttributes("repost", false)).toEqual({ "data-state": "inactive", "aria-pressed": false });
    expect(getPostActionAttributes("comments", true)).toEqual({ "data-state": "active", "aria-expanded": true });
  });
});
