import { describe, expect, it } from "vitest";
import { trustLevelPresentation } from "../src/lib/social/trust-points-panel";

describe("presentación de Puntos de confianza", () => {
  it("clasifica los niveles de forma consistente", () => {
    expect(trustLevelPresentation(2).label).toBe("crítico");
    expect(trustLevelPresentation(6).label).toBe("bajo");
    expect(trustLevelPresentation(7).label).toBe("normal");
  });

  it("conserva el color de progreso asociado a cada nivel", () => {
    expect(trustLevelPresentation(0).progressColor).toBe("#ef4444");
    expect(trustLevelPresentation(4).progressColor).toBe("#f59e0b");
    expect(trustLevelPresentation(10).progressColor).toBe("#10b981");
  });
});
