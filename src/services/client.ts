/**
 * Frappe call wrapper — the single chokepoint for every backend call. Encodes
 * the exact contract from docs/job card and parts.md "How API calls work":
 *   - POST /api/method/<dotted.path>, JSON body
 *   - nested objects/arrays are JSON-encoded as strings; booleans go as 1/0
 *   - responses are wrapped in { message: <payload> } — unwrap it
 *   - errors arrive as _server_messages (JSON array) or exception — clean them
 */
import { authHeaders } from "./config";
import { apiUrl } from "./endpoints";

export class FrappeError extends Error {
  constructor(
    message: string,
    public readonly method: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "FrappeError";
  }
}

type Args = Record<string, unknown>;

/** Serialize args the way the desktop `_client.ts` does. */
export function serialize(args: Args): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(args)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "boolean") out[k] = v ? 1 : 0;
    else if (typeof v === "object") out[k] = JSON.stringify(v);
    else if (typeof v === "number") out[k] = v;
    else out[k] = String(v);
  }
  return out;
}

/** Call a whitelisted method and return the unwrapped `message` payload. */
export async function call<T>(method: string, args: Args = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(method), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...authHeaders(),
      },
      body: JSON.stringify(serialize(args)),
    });
  } catch (e) {
    throw new FrappeError(`Network error — ${(e as Error).message}`, method);
  }

  const text = await res.text();
  const body = text ? safeParse(text) : {};

  if (!res.ok) throw new FrappeError(cleanError(body) ?? `Request failed (${res.status})`, method, res.status);
  return (body as { message: T }).message;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { exception: text };
  }
}

/** Pull a human message out of Frappe's _server_messages / exception. */
function cleanError(body: unknown): string | undefined {
  const b = body as { _server_messages?: string; exception?: string; message?: string };
  if (b?._server_messages) {
    try {
      const msgs = JSON.parse(b._server_messages) as string[];
      const first = JSON.parse(msgs[0]) as { message?: string };
      if (first?.message) return stripHtml(first.message);
    } catch {
      /* fall through */
    }
  }
  if (b?.exception) return stripHtml(b.exception.replace(/^.*?:\s*/, ""));
  if (typeof b?.message === "string") return stripHtml(b.message);
  return undefined;
}

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();
