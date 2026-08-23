import { IDEA_HERO_COPY } from "../src/lib/auth/idea-hero";
import { describe, expect, it } from "vitest";

describe("cabecera de acceso centrada en ideas", () => {
  it("presenta una invitación concreta a imaginar un juego sin prometer funciones ficticias", () => {
    const copy = `${IDEA_HERO_COPY.title} ${IDEA_HERO_COPY.description}`;

    expect(IDEA_HERO_COPY.title).toBe("Tu próximo juego puede empezar con una pregunta");
    expect(copy).not.toMatch(/editor visual|lógica con bloques|publica al instante/i);
    expect(IDEA_HERO_COPY.description).toContain("Una escena");
  });
});
