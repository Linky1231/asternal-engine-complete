import { randomUUID } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_STATE_COOKIE = "__Host-google_oauth_state";
const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";
// This is the production domain explicitly registered in the Google Cloud OAuth client.
const GOOGLE_REDIRECT_URI = `https://asternaleng-dvlqmnye.manus.space${GOOGLE_CALLBACK_PATH}`;

type GoogleTokenResponse = { id_token?: string; error?: string; error_description?: string };

function redirectToAuth(res: Response, result: "cancelled" | "failed" | "missing") {
  res.redirect(302, `/auth?google=${result}`);
}

function stateCookieOptions(req: Request) {
  return { ...getSessionCookieOptions(req), sameSite: "lax" as const, maxAge: 10 * 60 * 1000 };
}

function getQueryString(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerGoogleOAuthRoutes(app: Express) {
  app.get("/api/auth/google/start", (req, res) => {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      redirectToAuth(res, "failed");
      return;
    }

    const state = randomUUID();
    res.cookie(GOOGLE_STATE_COOKIE, state, stateCookieOptions(req));

    const authorization = new URL(GOOGLE_AUTHORIZATION_URL);
    authorization.searchParams.set("client_id", ENV.googleClientId);
    authorization.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
    authorization.searchParams.set("response_type", "code");
    authorization.searchParams.set("scope", "openid email profile");
    authorization.searchParams.set("state", state);
    authorization.searchParams.set("prompt", "select_account");
    res.redirect(302, authorization.toString());
  });

  app.get(GOOGLE_CALLBACK_PATH, async (req, res) => {
    const providerError = getQueryString(req, "error");
    const code = getQueryString(req, "code");
    const state = getQueryString(req, "state");
    const expectedState = parseCookieHeader(req.headers.cookie ?? "")[GOOGLE_STATE_COOKIE];

    if (providerError) {
      res.clearCookie(GOOGLE_STATE_COOKIE, stateCookieOptions(req));
      redirectToAuth(res, "cancelled");
      return;
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      res.clearCookie(GOOGLE_STATE_COOKIE, stateCookieOptions(req));
      redirectToAuth(res, "missing");
      return;
    }
    res.clearCookie(GOOGLE_STATE_COOKIE, stateCookieOptions(req));

    try {
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: GOOGLE_REDIRECT_URI,
        }),
      });
      const token = (await response.json()) as GoogleTokenResponse;
      if (!response.ok || !token.id_token) {
        console.error("[Google OAuth] Token exchange failed", token.error ?? response.status);
        redirectToAuth(res, "failed");
        return;
      }

      const { payload } = await jwtVerify(token.id_token, GOOGLE_JWKS, {
        audience: ENV.googleClientId,
        issuer: ["https://accounts.google.com", "accounts.google.com"],
      });
      const sub = typeof payload.sub === "string" ? payload.sub : "";
      const email = typeof payload.email === "string" ? payload.email : null;
      const name = typeof payload.name === "string" ? payload.name : null;
      if (!sub || !email || payload.email_verified !== true) {
        console.error("[Google OAuth] Verified identity is missing a confirmed email");
        redirectToAuth(res, "failed");
        return;
      }

      const openId = `google_${sub}`;
      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: name ?? email,
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, "/auth?google=success");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error instanceof Error ? error.message : error);
      redirectToAuth(res, "failed");
    }
  });
}
