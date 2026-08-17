import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

describe("OAuth cookie policy", () => {
  it("marks the session cookie Secure when the public request is HTTPS", () => {
    const options = getSessionCookieOptions({
      protocol: "http",
      headers: { "x-forwarded-proto": "https" },
    } as never);

    expect(options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });

  it("keeps the local HTTP preview usable", () => {
    const options = getSessionCookieOptions({
      protocol: "http",
      headers: {},
    } as never);

    expect(options.secure).toBe(false);
  });
});
