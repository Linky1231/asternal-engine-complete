/*
 * Asternal visual note: this helper is intentionally UI-agnostic. It preserves the
 * existing soft blue authentication experience while keeping QR redirects internal.
 */

const PENDING_QR_PROFILE_KEY = "asternal_pending_qr_profile";

function isInternalProfilePath(value: string): boolean {
  return /^\/profile\/[^/?#]+(?:\?[^#]*)?$/.test(value);
}

export function setPendingQrProfile(destination: string): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(destination, window.location.origin);
    if (url.origin !== window.location.origin) return;
    const path = `${url.pathname}${url.search}`;
    if (!isInternalProfilePath(path)) return;
    window.sessionStorage.setItem(PENDING_QR_PROFILE_KEY, path);
  } catch {
    // Ignore malformed destinations; authentication should remain usable.
  }
}

export function getPendingQrProfile(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(PENDING_QR_PROFILE_KEY);
    return value && isInternalProfilePath(value) ? value : null;
  } catch {
    return null;
  }
}

export function consumePendingQrProfile(): string | null {
  const destination = getPendingQrProfile();
  if (typeof window !== "undefined") {
    try { window.sessionStorage.removeItem(PENDING_QR_PROFILE_KEY); } catch { /* noop */ }
  }
  return destination;
}
