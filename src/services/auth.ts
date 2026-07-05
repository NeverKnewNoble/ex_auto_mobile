import { getApiBase } from "./config";
import { call, FrappeError, isOfflineError } from "./client";
import { clearCache } from "./cache";
import { ENDPOINTS } from "./endpoints";
import {
  clearOfflineCredential,
  clearSession,
  loadOfflineCredential,
  saveOfflineCredential,
  saveSession,
} from "./session";
import type { AuthUser, LoginCredentials, LoginResult, Session } from "@/types/auth";

const E = ENDPOINTS.auth;

/**
 * Non-cryptographic fingerprint of a credential set — enough to check "same
 * site + user + password as last time" for the offline gate. The token pair it
 * unlocks already lives in the OS secure store; this only equality-checks.
 */
function fingerprint(site: string, usr: string, pwd: string): string {
  const s = `${site}\n${usr}\n${pwd}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/**
 * Turn a raw `call()` failure into a message that's safe to show on the login
 * screen — Frappe's auth exceptions and tracebacks should never reach the user.
 */
function loginErrorMessage(e: unknown): string {
  if (e instanceof FrappeError) {
    const msg = (e.message || "").toLowerCase();
    const looksLikeAuth =
      e.status === 401 ||
      e.status === 403 ||
      e.status === 417 ||
      msg.includes("authentication") ||
      msg.includes("invalid login") ||
      msg.includes("incorrect password") ||
      msg.includes("not allowed to log in");
    if (looksLikeAuth) return "Incorrect email or password.";
    if (e.status === 404) return "We couldn’t find that site. Double-check the site URL.";
    if (e.status && e.status >= 500) return "The server had a problem. Please try again shortly.";
    // Only surface the server's own text when it's short and human-looking.
    return e.message && e.message.length <= 120 ? e.message : "Couldn’t sign in. Please try again.";
  }
  return (e as Error)?.message || "Couldn’t sign in. Please try again.";
}

/**
 * Authentication — talks to the custom `ex_auto.api.auth.*` endpoints. `login`
 * verifies the credentials, the backend ensures an API key/secret exists
 * (generating them if missing), and we persist the token pair so every
 * subsequent `call()` is authenticated via `authHeaders()`.
 */
export class AuthService {
  static async login(creds: LoginCredentials): Promise<AuthUser> {
    const usr = creds.usr.trim();
    const fp = fingerprint(getApiBase(), usr, creds.pwd);

    let res: LoginResult;
    try {
      res = await call<LoginResult>(E.login, { usr, pwd: creds.pwd });
    } catch (e) {
      // Offline: re-grant access if these are the same credentials that last
      // signed in on this device.
      if (isOfflineError(e)) {
        const rec = await loadOfflineCredential();
        if (rec && rec.fp === fp) {
          await saveSession(rec.session);
          return rec.session.user;
        }
        throw new Error("You’re offline. Connect to the internet to sign in for the first time.");
      }
      // Everything else (bad password, wrong site, server error) → clean message.
      throw new Error(loginErrorMessage(e));
    }

    if (!res.success || !res.api_key || !res.api_secret) {
      throw new Error(res.message?.trim() || "Incorrect email or password.");
    }

    // User details may arrive nested (user / user_details / user_info) or flat.
    const r = res as unknown as Record<string, unknown>;
    const raw = (res.user ?? r.user_details ?? r.user_info ?? {}) as Record<string, unknown>;
    const pick = (k: string) => (raw[k] ?? r[k]) as never;

    const user: AuthUser = {
      name: (pick("name") as string) ?? usr,
      full_name: (pick("full_name") as string) ?? (pick("name") as string) ?? usr,
      email: (pick("email") as string) ?? usr,
      user_image: pick("user_image"),
      roles: pick("roles"),
      branch: pick("branch"),
      technician: pick("technician"),
      technician_name: pick("technician_name"),
    };

    const session: Session = { apiKey: res.api_key, apiSecret: res.api_secret, user };
    await saveSession(session);
    await saveOfflineCredential(fp, session); // enables offline re-login next time
    return user;
  }

  /** Refresh the current user from the server (token already stored). */
  static me() {
    return call<AuthUser>(E.me, {});
  }

  static async logout(): Promise<void> {
    // Full sign-out: drop the session, the offline re-login key, and every
    // cached response so the next user starts clean.
    await clearSession();
    await clearOfflineCredential();
    clearCache();
  }
}

// ── public API ──
export const login = (creds: LoginCredentials) => AuthService.login(creds);
export const fetchCurrentUser = () => AuthService.me();
export const logout = () => AuthService.logout();
