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

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Fixed "now" for the design pass so running timers read consistently.
// "Today" in the mock data is 2026-06-28; pin a mid-morning moment.
const NOW = new Date("2026-06-28T10:34:00").getTime();
