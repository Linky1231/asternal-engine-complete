import { describe, expect, it } from "vitest";
import { mergeRecommendedIds, parseModerationDecision } from "./community-ai";

describe("decisiones comunitarias de Orión", () => {
  it("acepta una respuesta JSON de moderación y limita sus textos", () => {
    expect(parseModerationDecision('```json\n{"allowed":false,"reason":"Falta contexto seguro","summary":"Revisar la regla 2"}\n```')).toEqual({
      allowed: false,
      reason: "Falta contexto seguro",
      summary: "Revisar la regla 2",
    });
  });

  it("preserva todos los posts y elimina ids duplicados o inventados del ranking", () => {
    expect(mergeRecommendedIds(["a", "b", "c"], ["b", "desconocido", "b"])).toEqual(["b", "a", "c"]);
  });
});
