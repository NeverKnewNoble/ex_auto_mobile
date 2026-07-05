/**
 * On-device read cache — a file-system-backed store for GET-style API responses.
 *
 * Strategy (see use-fetch + services): TTL cache-first with an offline fallback.
 *   - Within the TTL, `cachedCall()` serves the stored copy and skips the network
 *     entirely, so re-visiting a screen doesn't hammer the same endpoint.
 *   - Past the TTL it fetches, and overwrites the cache with the fresh payload
 *     (the "update when the data differs" part — a no-op write when it matches).
 *   - If the fetch fails because we're offline, the last stored copy is returned
 *     so screens keep rendering without a connection.
 *
 * Entries live as one JSON file each under `<cache>/exauto-cache`, keyed by a
 * hash of `<user>|<method>|<args>`. One file per entry lets the Offline & storage
 * modal size and clear the whole cache by listing the directory. This is a cache,
 * not a source of truth — the OS may evict `Paths.cache` under storage pressure.
 */
import { Directory, File, Paths } from "expo-file-system";
import { call, isOfflineError } from "./client";
import { getSession } from "./session";

type Args = Record<string, unknown>;

interface Entry {
  key: string;
  method: string;
  ts: number;
  data: unknown;
}

/** Freshness windows (ms) by shape of data — reads pass one of these. */
export const TTL = {
  list: 60_000, // list screens — refresh at most once a minute
  detail: 45_000, // a single record
  counts: 30_000, // status tallies / small summaries
  summary: 60_000,
  picker: 300_000, // typeahead sources rarely change within a session
} as const;

const cacheDir = new Directory(Paths.cache, "exauto-cache");

function ensureDir(): void {
  try {
    if (!cacheDir.exists) cacheDir.create();
  } catch {
    /* best-effort — a failed create just means every op below no-ops */
  }
}

/** Deterministic stringify (sorted keys) so arg order never changes the key. */
function stable(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stable(o[k])}`)
    .join(",")}}`;
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/** Scope the key to the signed-in user so two accounts never share cache. */
function cacheKey(method: string, args: Args): string {
  const user = getSession()?.user?.name ?? "guest";
  return `${user}|${method}|${stable(args)}`;
}

function fileFor(key: string): File {
  return new File(cacheDir, `${hash(key)}.json`);
}

async function readEntry(key: string): Promise<Entry | null> {
  ensureDir();
  const file = fileFor(key);
  try {
    if (!file.exists) return null;
    const raw = await file.text();
    const e = JSON.parse(raw) as Entry;
    // Guard against the (rare) hash collision by re-checking the full key.
    return e.key === key ? e : null;
  } catch {
    return null;
  }
}

function writeEntry(key: string, method: string, data: unknown): void {
  ensureDir();
  try {
    fileFor(key).write(JSON.stringify({ key, method, ts: Date.now(), data } satisfies Entry));
  } catch {
    /* out of space / evicted mid-write — the cache is optional, so swallow it */
  }
}

/**
 * Read wrapper: serve fresh cache, otherwise fetch (and refresh the cache), and
 * fall back to stale cache when the fetch fails offline. Drop-in for `call()` on
 * any read endpoint; never use it for actions/writes.
 */
export async function cachedCall<T>(method: string, args: Args = {}, ttl: number = TTL.list): Promise<T> {
  const key = cacheKey(method, args);
  const entry = await readEntry(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data as T;

  try {
    const data = await call<T>(method, args);
    writeEntry(key, method, data);
    return data;
  } catch (e) {
    if (entry && isOfflineError(e)) return entry.data as T; // last-known-good, offline
    throw e;
  }
}

export interface CacheStats {
  count: number;
  bytes: number;
}

/** Total number of cached responses and the bytes they occupy on disk. */
export function cacheStats(): CacheStats {
  ensureDir();
  let count = 0;
  let bytes = 0;
  try {
    for (const item of cacheDir.list()) {
      if (item instanceof File) {
        count++;
        try {
          bytes += item.size ?? 0;
        } catch {
          /* file vanished between list() and size — skip it */
        }
      }
    }
  } catch {
    /* directory missing — treat as empty */
  }
  return { count, bytes };
}

/** Free space left on the device, in bytes (for the storage modal). */
export function availableDiskSpace(): number {
  try {
    return Paths.availableDiskSpace;
  } catch {
    return 0;
  }
}

/** Wipe every cached response. */
export function clearCache(): void {
  try {
    if (cacheDir.exists) cacheDir.delete();
  } catch {
    /* ignore — recreated below */
  }
  ensureDir();
}
