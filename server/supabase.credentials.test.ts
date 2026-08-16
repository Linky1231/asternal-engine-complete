import { describe, expect, it } from "vitest";

describe("Supabase migration credentials", () => {
  it("accepts the configured private key on a read-only REST request", async () => {
    const baseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!baseUrl || !serviceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for migration validation");
    }

    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/rest/v1/`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    expect(response.ok).toBe(true);
  }, 15_000);
});
