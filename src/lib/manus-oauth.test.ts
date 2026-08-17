import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const";

describe("Manus OAuth social login", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("inicia Google usando el callback de producción y un estado seguro", async () => {
    vi.stubEnv("VITE_OAUTH_PORTAL_URL", "https://oauth.manus.test");
    vi.stubEnv("VITE_APP_ID", "asternal-test");

    const assign = vi.fn();
    let cookie = "";
    vi.stubGlobal("window", {
      location: { origin: "https://asternaleng-dvlqmnye.manus.space", assign },
    });
    vi.stubGlobal("document", {
      get cookie() {
        return cookie;
      },
      set cookie(value: string) {
        cookie = value;
      },
    });

    const { startGoogleLogin } = await import("./manus-oauth");
    startGoogleLogin();

    const url = new URL(assign.mock.calls[0]?.[0]);
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("provider")).toBe("google");
    expect(url.searchParams.get("app_id")).toBe("asternal-test");
    expect(url.searchParams.get("redirect_url")).toBe(
      "https://asternaleng-dvlqmnye.manus.space/api/oauth/callback",
    );

    const state = decodeOAuthState(url.searchParams.get("state") ?? "");
    expect(state.redirectUri).toBe("https://asternaleng-dvlqmnye.manus.space/api/oauth/callback");
    expect(cookie).toContain(`${OAUTH_STATE_COOKIE}=${state.nonce}`);
  });
});
