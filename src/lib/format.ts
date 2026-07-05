/** Small, dependency-free formatters for the readout treatment. */

/** "2026-06-28T08:00:00" → "08:00". */
export function timeOf(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "2026-06-28" → "Sat 28 Jun". */
export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

/** Elapsed time between two ISO timestamps (or now), as "1h 24m" / "12m". */
export function elapsed(startIso: string, endIso?: string): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : NOW;
  const mins = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${pad(m)}m` : `${m}m`;
}

/** Thousands-separated odometer / counts. */
export function num(n: number): string {
  return n.toLocaleString("en-US");
}

/** Byte count → "0 B" / "812 KB" / "4.2 MB" for storage readouts. */
export function bytes(n: number): string {
  if (!n || n < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${i === 0 || v >= 100 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

/** Cedi money readout, 2 decimals. */
export function money(n: number): string {
  return `GH₵ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "2026-06-28" or ISO → "28 Jun". */
export function dateShort(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/** ISO datetime → "28 Jun, 14:05". */
export function dateTimeShort(iso?: string): string {
  if (!iso) return "—";
  return `${dateShort(iso)}, ${timeOf(iso)}`;
}

/** Current local time as ISO (for new time logs). */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Real-time "just now" / "5m ago" / "2h ago" / "3d ago" from a Frappe timestamp
 * ("2026-07-05 14:48:11.123"). Unlike `elapsed`, this reads the actual clock —
 * notifications are live data, not part of the pinned design moment.
 */
export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso.slice(0, 19).replace(" ", "T")).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return dateShort(iso);
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Fixed "now" for the design pass so running timers read consistently.
// "Today" in the mock data is 2026-06-28; pin a mid-morning moment.
const NOW = new Date("2026-06-28T10:34:00").getTime();
