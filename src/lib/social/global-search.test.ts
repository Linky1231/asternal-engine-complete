import { describe, expect, it } from "vitest";
import { messagePreview } from "./search-utils";

describe("previsualizaciones del buscador", () => {
  it("muestra etiquetas comprensibles para mensajes y contenido multimedia", () => {
    expect(messagePreview({ kind: null, media_type: "image/jpeg", content: null })).toBe("🖼️ Foto");
    expect(messagePreview({ kind: "poll", media_type: null, content: "¿Qué jugamos?" })).toBe("📊 Encuesta: ¿Qué jugamos?");
    expect(messagePreview({ kind: null, media_type: null, content: "Proyecto actualizado" })).toBe("Proyecto actualizado");
  });
});
