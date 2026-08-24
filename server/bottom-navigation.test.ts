import { describe, expect, it } from "vitest";
import { bottomNavigationCellClass, bottomNavigationGridClass, bottomNavigationIndicatorClass } from "../src/lib/social/bottom-navigation";

describe("geometría de la navegación inferior", () => {
  it("reserva cinco celdas idénticas y contiene el selector en la celda activa", () => {
    expect(bottomNavigationGridClass).toContain("grid-cols-5");
    expect(bottomNavigationCellClass).toContain("min-w-0");
    expect(bottomNavigationIndicatorClass).toContain("inset-0");
    expect(bottomNavigationIndicatorClass).not.toContain("calc(");
    expect(bottomNavigationIndicatorClass).not.toContain("translate");
  });
});
