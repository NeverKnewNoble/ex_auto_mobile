/**
 * Device session store. Holds the API key/secret + user, persisted in the OS
 * secure store (Keychain / Keystore). An in-memory cache is the source of truth
 * at runtime so `authHeaders()` is synchronous; `loadSession()` hydrates it on
 * boot.
 */
import * as SecureStore from "expo-secure-store";
import type { Session } from "@/types/auth";

const KEY = "exauto.session";
const OFFLINE_KEY = "exauto.offline";

let current: Session | null = null;

/**
 * Offline-login record: a fingerprint of the last credentials that logged in
 * successfully, plus the session they produced. Lets `login()` re-grant access
 * without a connection when the same credentials are entered again. Survives the
 * TTL cache but is cleared on an explicit sign-out.
 */
interface OfflineRecord {
  fp: string;
  session: Session;
}

export async function saveOfflineCredential(fp: string, session: Session): Promise<void> {
  await SecureStore.setItemAsync(OFFLINE_KEY, JSON.stringify({ fp, session } satisfies OfflineRecord));
}

export async function loadOfflineCredential(): Promise<OfflineRecord | null> {
  try {
    const raw = await SecureStore.getItemAsync(OFFLINE_KEY);
    return raw ? (JSON.parse(raw) as OfflineRecord) : null;
  } catch {
    return null;
  }
}

export async function clearOfflineCredential(): Promise<void> {
  await SecureStore.deleteItemAsync(OFFLINE_KEY);
}

/** Hydrate the in-memory session from secure storage. Call once on app boot. */
export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    current = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    current = null;
  }
  return current;
}

/** Persist + cache a new session (after a successful login). */
export async function saveSession(session: Session): Promise<void> {
  current = session;
  await SecureStore.setItemAsync(KEY, JSON.stringify(session));
}

/** Clear the session (logout). */
export async function clearSession(): Promise<void> {
  current = null;
  await SecureStore.deleteItemAsync(KEY);
}

export function getSession(): Session | null {
  return current;
}

export function isAuthenticated(): boolean {
  return current !== null;
}

/** The `Authorization` header value, or undefined when logged out. */
export function getAuthToken(): string | undefined {
  if (!current) return undefined;
  return `token ${current.apiKey}:${current.apiSecret}`;
}
