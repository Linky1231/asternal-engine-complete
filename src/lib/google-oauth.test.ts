import { afterEach, describe, expect, it, vi } from "vitest";

describe("inicio de sesión Google de Asternal", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("abre únicamente el endpoint OAuth propio de Asternal", async () => {
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { assign } });

    const { startGoogleLogin } = await import("./google-oauth");
    startGoogleLogin();

    expect(assign).toHaveBeenCalledWith("/api/auth/google/start");
  });
});
