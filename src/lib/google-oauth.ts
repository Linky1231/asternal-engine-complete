/** Starts Asternal's own Google OAuth flow. The browser only visits Google and
 * Asternal; neither the Manus account portal nor a Manus callback is involved. */
export function startGoogleLogin(): void {
  window.location.assign("/api/auth/google/start");
}
