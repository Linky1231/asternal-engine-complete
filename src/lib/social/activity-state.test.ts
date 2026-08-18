import { describe, expect, it } from "vitest";
import { isFirstActivity } from "./activity-state";

describe("isFirstActivity", () => {
  it("muestra el estado de inicio cuando aún no existe actividad", () => {
    expect(isFirstActivity({ totalSeconds: 0, gameCount: 0, likeCount: 0 })).toBe(true);
  });

  it("muestra la bitácora en cuanto existe una señal real de actividad", () => {
    expect(isFirstActivity({ totalSeconds: 1, gameCount: 0, likeCount: 0 })).toBe(false);
    expect(isFirstActivity({ totalSeconds: 0, gameCount: 1, likeCount: 0 })).toBe(false);
    expect(isFirstActivity({ totalSeconds: 0, gameCount: 0, likeCount: 1 })).toBe(false);
  });
});
