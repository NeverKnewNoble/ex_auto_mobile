/**
 * Backend wiring. The site URL is entered on the login screen and persisted, so
 * every service call POSTs to `${getApiBase()}/api/method/<path>`. After login
 * the session holds the user's API key/secret, sent as
 * `Authorization: token <key>:<secret>`.
 *
 * Note: iOS simulator can reach 127.0.0.1 on the host; an Android emulator uses
 * 10.0.2.2, and a physical device needs the machine's LAN IP. Cleartext http is
 * blocked on device unless allowed in the native config (fine on iOS simulator).
 */
import * as SecureStore from "expo-secure-store";
import { getAuthToken } from "./session";

const BASE_KEY = "exauto.apiBase";
const DEFAULT_API_BASE = "http://127.0.0.1:8002";

let apiBase = DEFAULT_API_BASE;

/** Current site base URL (no trailing slash). */
export function getApiBase(): string {
  return apiBase;
}

function sanitize(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  // Default to https when the user omits the scheme (e.g. "example.erpxpand.com").
  if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

/** Set + persist the site URL (called from the login screen). */
export async function setApiBase(url: string): Promise<void> {
  apiBase = sanitize(url) || DEFAULT_API_BASE;
  await SecureStore.setItemAsync(BASE_KEY, apiBase);
}

/** Hydrate the saved site URL on boot. */
export async function loadApiBase(): Promise<string> {
  try {
    const saved = await SecureStore.getItemAsync(BASE_KEY);
    if (saved) apiBase = saved;
  } catch {
    /* keep default */
  }
  return apiBase;
}

/**
 * Headers added to every request. Empty while logged out (the login endpoint
 * itself is guest-accessible).
 */
export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: token } : {};
}
