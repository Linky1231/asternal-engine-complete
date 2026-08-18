import { describe, expect, it } from "vitest";
import { buildOrionMessages } from "./orion";
import { compactVoiceReply, pickFeminineSpanishVoice } from "./orion-voice";

describe("modo Voz de Orión", () => {
  it("prepara una respuesta breve y hablable", () => {
    expect(compactVoiceReply("**Hola**\n\n```ts\nconst x = 1\n```"))
      .toBe("Hola He preparado un ejemplo de código en el chat.");
  });

  it("prioriza una voz española femenina cuando el navegador la ofrece", () => {
    const selected = pickFeminineSpanishVoice([
      { name: "Google US English", lang: "en-US" },
      { name: "Jorge", lang: "es-ES" },
      { name: "Monica", lang: "es-ES" },
    ]);
    expect(selected?.name).toBe("Monica");
  });

  it("activa instrucciones breves y por turnos en el prompt de voz", () => {
    const [system] = buildOrionMessages([{ role: "user", content: "Hola" }], true);
    expect(system.content).toContain("MODO VOZ");
    expect(system.content).toContain("máximo de dos frases breves");
    expect(system.content).toContain("ceder el turno");
  });
});
