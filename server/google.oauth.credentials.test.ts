import { describe, expect, it } from "vitest";

describe("credenciales OAuth de Google", () => {
  it("son aceptadas por el endpoint de token", async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    expect(clientId, "GOOGLE_CLIENT_ID debe estar configurado").toBeTruthy();
    expect(clientSecret, "GOOGLE_CLIENT_SECRET debe estar configurado").toBeTruthy();

    const body = new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code: "credential-validation-no-authorization-code",
      grant_type: "authorization_code",
      redirect_uri: "https://asternaleng-dvlqmnye.manus.space/api/auth/google/callback",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const payload = (await response.json()) as { error?: string };

    // Google returns invalid_grant for our intentionally unusable code only
    // after it authenticates the OAuth client. invalid_client signals that the
    // supplied client ID/secret does not belong to a usable web client.
    expect(response.status).toBe(400);
    expect(payload.error).toBe("invalid_grant");
  }, 15_000);
});
