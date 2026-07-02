import { call } from "./client";
import { ENDPOINTS } from "./endpoints";
import { clearSession, saveSession } from "./session";
import type { AuthUser, LoginCredentials, LoginResult } from "@/types/auth";

const E = ENDPOINTS.auth;

/**
 * Authentication — talks to the custom `ex_auto.api.auth.*` endpoints. `login`
 * verifies the credentials, the backend ensures an API key/secret exists
 * (generating them if missing), and we persist the token pair so every
 * subsequent `call()` is authenticated via `authHeaders()`.
 */
export class AuthService {
  static async login(creds: LoginCredentials): Promise<AuthUser> {
    const usr = creds.usr.trim();
    const res = await call<LoginResult>(E.login, { usr, pwd: creds.pwd });

    if (!res.success || !res.api_key || !res.api_secret) {
      throw new Error(res.message || "Invalid email or password.");
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

    await saveSession({ apiKey: res.api_key, apiSecret: res.api_secret, user });
    return user;
  }

  /** Refresh the current user from the server (token already stored). */
  static me() {
    return call<AuthUser>(E.me, {});
  }

  static async logout(): Promise<void> {
    await clearSession();
  }
}

// ── public API ──
export const login = (creds: LoginCredentials) => AuthService.login(creds);
export const fetchCurrentUser = () => AuthService.me();
export const logout = () => AuthService.logout();
