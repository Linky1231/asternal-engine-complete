import { IDEA_HERO_COPY, IDEA_TILES } from "../src/lib/auth/idea-hero";
import { describe, expect, it } from "vitest";

describe("cabecera de acceso centrada en ideas", () => {
  it("presenta una invitación concreta a imaginar un juego sin prometer funciones ficticias", () => {
    const copy = `${IDEA_HERO_COPY.titleLead} ${IDEA_HERO_COPY.titleAccent} ${IDEA_HERO_COPY.description}`;

    expect(copy).toContain("una pregunta");
    expect(copy).not.toMatch(/editor visual|lógica con bloques|publica al instante/i);
    expect(IDEA_TILES.map(tile => tile.key)).toEqual(["pregunta", "lugar", "pulso"]);
  });
});
