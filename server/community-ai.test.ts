import { describe, expect, it } from "vitest";
import { mergeRecommendedIds, normalizeOriginalityCandidate, parseModerationDecision } from "./community-ai";

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

  it("normaliza metadatos creativos sin aceptar métricas sociales ni URLs de adjuntos", () => {
    const candidate = normalizeOriginalityCandidate({
      id: "post-a",
      content: "Un mundo hecho de sombras",
      media: { type: "image", count: 99, hasCover: true, screenshotCount: 2 },
      documentNames: ["diseno.pdf"],
      poll: { question: "¿Qué final prefieres?", optionCount: 3 },
      likes: 500,
      documentUrls: ["https://untrusted.example/file.pdf"],
    });

    expect(candidate).toMatchObject({
      id: "post-a",
      media: { type: "image", count: 4, hasCover: true, screenshotCount: 2 },
      documentNames: ["diseno.pdf"],
      poll: { question: "¿Qué final prefieres?", optionCount: 3 },
    });
    expect(candidate).not.toHaveProperty("likes");
    expect(candidate).not.toHaveProperty("documentUrls");
  });
});
