import { encodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const";

export type ManusOAuthProvider = "google" | "tiktok";

/**
 * Starts a provider-specific Manus OAuth flow from the legacy auth screen.
 * The callback remains the single server-owned Manus callback; this helper only
 * creates the browser-bound state and navigates to the portal.
 */
export function startProviderLogin(provider: ManusOAuthProvider): void {
  const oauthPortalUrl = String(import.meta.env.VITE_OAUTH_PORTAL_URL ?? "").trim();
  const appId = String(import.meta.env.VITE_APP_ID ?? "").trim();

  if (!oauthPortalUrl || !appId) {
    throw new Error("El inicio de sesión social no está configurado en este entorno.");
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${oauthPortalUrl.replace(/\/$/, "")}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  url.searchParams.set("provider", provider);

  window.location.assign(url.toString());
}

export function startGoogleLogin(): void {
  startProviderLogin("google");
}

export function startTikTokLogin(): void {
  startProviderLogin("tiktok");
}
