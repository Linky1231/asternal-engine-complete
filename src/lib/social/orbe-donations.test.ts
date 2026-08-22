import { describe, expect, it } from "vitest";
import { donationError } from "./orbe-donations";

describe("donationError", () => {
  it("rechaza cantidades no enteras o no positivas", () => {
    expect(donationError(0, 50)).toBe("Elige una cantidad válida");
    expect(donationError(1.5, 50)).toBe("Elige una cantidad válida");
  });

  it("impide gastar más orbes que el saldo disponible", () => {
    expect(donationError(51, 50)).toBe("No tienes suficientes orbes");
    expect(donationError(50, 50)).toBeNull();
  });
});
