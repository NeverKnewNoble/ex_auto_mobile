# Mobile App — Technician / Field Companion

A companion mobile app for ExAuto should own the **shop-floor half** of the system — the
work done with hands on the vehicle, where a phone or tablet beats walking back to a desk.
The web portal stays the advisor/manager office tool; the mobile app is the
**technician + inspector field tool**.

This document defines **what the mobile app should do** and **how it should look** so it
stays visually consistent with the existing "Garage Console" portal.

---

## 1. Scope — what belongs on mobile

The system divides cleanly into shop-floor (mobile-friendly) and back-office (desktop) work.
Build the mobile app around the shop-floor spine; leave pricing-, approval-, and
config-heavy flows on the web portal.

### Build (shop-floor / on-the-vehicle)

| Priority | Domain | Why it's mobile-native | API module |
|----------|--------|------------------------|------------|
| **P0** | **Inspections** (`Inspection Report` + `Inspection Photo` + `Inspection Checklist Item`) | The most camera-driven flow in the system: walk-around, QC, pre-delivery. Tap checklist items OK/Failed/Attention, shoot photos, capture signature. | `inspections.py` |
| **P0** | **Job Cards** (`Job Card` + `Checklist` + `Part` + `Labor` + `Time Log`) | The live work order. Mobile slices: view assigned jobs, tick checklist as work progresses, start/stop **time logs**, log parts consumed, capture **delivery signature**. | `job_cards.py` |
| **P1** | **Appointments** (`Appointment`) | The entry point: view today's schedule, confirm arrivals, see vehicle/customer/complaint, convert into a job card. | `appointments.py` |
| **P1** | **Parts Requisition** (`Parts Requisition`) | "Request this part from the floor" — quick capture from where the car is. Warehouse fulfillment stays back-office. | `parts.py` |
| **P2** | **Vehicle / Customer lookup** (read-only) | Scan plate / search to pull history, warranty, odometer while standing at the car. | `vehicles.py`, `customers.py` |

### The two device-native capabilities that justify "mobile"

1. **Camera / photo capture** — inspection photos (front, rear, engine, damage), job evidence.
   Reuse the upload path the portal already uses: `services/files.ts` → `/api/method/upload_file`.
2. **Signature capture** — customer/inspector signatures on inspections and job delivery.

If you build one app, the minimum viable spine is **Appointments → Job Card execution →
Inspection with photo + signature**. Everything else is additive.

### Don't build (back-office / desktop)

Estimates, billing (Sales Order → Invoice), AMC contracts, coupons, loyalty, warranty claims,
feedback surveys, service packages, and all Masters/configuration. These are keyboard-and-screen
approval/pricing/config work.

---

## 2. Design system — "Garage Console"

> Pit-wall motorsport meets technical drafting. Signal red on warm concrete (light) /
> asphalt (dark). Source of truth: `portal/src/index.css`.

The mobile app must reuse these exact tokens so the two surfaces feel like one product.
Colors are authored in **OKLCH**. Hex equivalents are approximate (for design tools that
can't take OKLCH); always prefer the OKLCH value in code.

### 2.1 Core palette — Light (default)

| Token | OKLCH | ≈ Hex | Role |
|-------|-------|-------|------|
| `--background` | `oklch(0.962 0.006 95)` | `#F4F2EC` | Warm concrete — app background |
| `--foreground` | `oklch(0.16 0.01 270)` | `#1B1C20` | Near-black ink — body text |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Card / sheet surface |
| `--primary` | `oklch(0.585 0.215 27)` | `#E11D2A` | **Signal red** — the workshop's voice; primary actions |
| `--primary-foreground` | `oklch(0.99 0 0)` | `#FCFCFC` | Text on red |
| `--secondary` | `oklch(0.92 0.008 95)` | `#E8E6DF` | Quiet button / chip surface |
| `--muted` | `oklch(0.94 0.006 95)` | `#EDEBE5` | Muted surface |
| `--muted-foreground` | `oklch(0.45 0.01 270)` | `#6B6C71` | Secondary text, labels |
| `--accent` | `oklch(0.74 0.16 220)` | `#3FA9D6` | Electric cyan — highlights, links |
| `--destructive` | `oklch(0.55 0.22 25)` | `#D32E2E` | Delete / irreversible |
| `--border` / `--input` | `oklch(0.88 0.008 90)` | `#DAD8D0` | Hairlines, field borders |
| `--ring` | `oklch(0.585 0.215 27 / 0.4)` | — | Focus ring (red @ 40%) |

### 2.2 Core palette — Dark

| Token | OKLCH | ≈ Hex | Role |
|-------|-------|-------|------|
| `--background` | `oklch(0.155 0.008 270)` | `#0B0C0F` | Asphalt |
| `--foreground` | `oklch(0.95 0.006 95)` | `#F0EFEA` | Off-white text |
| `--card` | `oklch(0.205 0.008 270)` | `#16171B` | Lifted surface |
| `--primary` | `oklch(0.66 0.22 27)` | `#FF3F4C` | Brighter signal red on dark |
| `--accent` | `oklch(0.78 0.18 220)` | `#46B6E6` | Cyan |
| `--border` / `--input` | `oklch(0.28 0.008 270)` | `#2A2C31` | Hairlines |

The app supports **light and dark** (portal uses `next-themes`). On a shop floor, dark mode +
high contrast is often preferred under glare — make the theme toggle easy to reach.

### 2.3 Signal palette — status pills

Status is communicated with a 4-color "signal" system (traffic-light semantics). Pills render
as `border-{tone}/40 bg-{tone}/10 text-{tone}` — a tinted 10% fill, 40% border, solid text.

| Tone | Token (light) | ≈ Hex | Meaning | Example statuses |
|------|---------------|-------|---------|------------------|
| **go** | `--signal-go` `oklch(0.68 0.18 145)` | `#3DAE5A` | Green — done / good | Approved, Active, Completed, Delivered, Invoiced |
| **warn** | `--signal-warn` `oklch(0.78 0.16 75)` | `#D99A1C` | Amber — needs attention | Pending, Scheduled, Quality Check, Expiring Soon |
| **stop** | `--signal-stop` `oklch(0.585 0.215 27)` | `#E11D2A` | Red — blocked / failed | Cancelled, Rejected, Failed, No Show |
| **info** | `--signal-info` `oklch(0.66 0.16 230)` | `#3B82E6` | Blue — in flight | Sent, In Progress, Confirmed, Under Review |

Inspection checklist results map directly: **OK → go**, **Attention → warn**, **Failed → stop**.
The full status→tone map lives in `portal/src/types/workflow.ts` (`statusTone()`); mirror it
on mobile rather than re-inventing it.

### 2.4 Sidebar / control-panel surface

The portal sidebar is **always dark** ("it's a control panel") regardless of theme. On mobile,
apply the same treatment to the **bottom tab bar / nav** so it reads as the persistent control
surface:

| Token | OKLCH | ≈ Hex |
|-------|-------|-------|
| `--sidebar` | `oklch(0.18 0.008 270)` | `#101216` |
| `--sidebar-foreground` | `oklch(0.88 0.005 95)` | `#DBDAD5` |
| `--sidebar-primary` | `oklch(0.65 0.22 27)` | `#FB3B48` (brighter red on dark) |
| `--sidebar-accent` | `oklch(0.235 0.008 270)` | `#1C1E23` (active item bg) |

---

## 3. Typography

Three Google Fonts, loaded in `portal/index.html`. Bundle them with the app (don't rely on
network on a shop floor).

| Role | Family | Weights | Usage |
|------|--------|---------|-------|
| **Body / UI** (`--font-sans`) | **Atkinson Hyperlegible** | 400, 700 (+ italics) | All UI text. Designed for max legibility — ideal under garage lighting / at arm's length. |
| **Display** (`--font-display`) | **Big Shoulders Display** | 500, 700, 800, 900 | Headings, page titles, KPI numbers, the motorsport "console" feel. Condensed — great for narrow mobile headers. |
| **Mono / readout** (`--font-mono`) | **JetBrains Mono** | 400, 500, 600 | Numeric readouts — job IDs, plate numbers, time logs, money, odometer. Use **tabular figures**. |

```css
--font-sans:    'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-display: 'Big Shoulders Display', 'Atkinson Hyperlegible', sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
```

**Readout rule** — any number that updates or gets read aloud (IDs, plates, times, totals) uses
the `.readout` treatment: JetBrains Mono, `font-variant-numeric: tabular-nums`, `letter-spacing: -0.02em`.
Body text uses font features `'ss01', 'cv11'`.

---

## 4. Shape, spacing & motion

| Token | Value | Note |
|-------|-------|------|
| `--radius` | `0.75rem` (12px) | Base radius. Derived: `sm` 8px, `md` 10px, `lg` 12px, `xl` 16px, `2xl` 20px. Soft, modern. |
| Card fill | `--card` over `--background` | Cards sit on concrete/asphalt. |

**Signature textures** (carry these to mobile for brand continuity, sparingly):

- **`.garage-grid`** — a faint drafting-grid backdrop (32px cells, `foreground` @ 4–6%) on main
  content areas.
- **`.live-dot`** — a scanline shimmer (`scan` keyframe, 1.6s) on "live"/in-progress badges —
  e.g. a job with a running time log.

### Mobile-specific guidance (not in the portal, add for touch)

- **Touch targets ≥ 44×44pt.** The portal is pointer-first; size up for gloves/thumbs.
- **Bottom tab nav** using the dark sidebar tokens; 4–5 tabs max:
  `Today (appointments)` · `Jobs` · `Inspect` · `Parts` · `More`.
- **Thumb-reachable primary action** — float the signal-red primary CTA (Start Job, Add Photo,
  Sign Off) bottom-right.
- **Offline-tolerant capture** — photos and checklist ticks should queue and sync; the floor has
  dead spots. Optimistic UI, then reconcile against the Frappe response.
- **One-hand inspection flow** — checklist as a single scrollable column of OK / Attention / Fail
  segmented controls, big enough to tap without looking.

---

## 5. Backend — how mobile talks to ExAuto

Mobile reuses the **same whitelisted Frappe API** the portal uses — no new backend required.

- **Endpoints**: `/api/method/ex_auto.api.<module>.<function>` (see [api.md](api.md)).
  Primary modules for mobile: `appointments`, `job_cards`, `inspections`, `parts`,
  `vehicles`, `customers`, `search`.
- **Auth**: Frappe session + CSRF token. A native app should use token-based auth
  (API key/secret or OAuth) rather than the cookie+CSRF flow the SPA uses.
- **File upload**: multipart `POST /api/method/upload_file` (mirror `portal/src/services/files.ts`)
  for photos and signatures.
- **Types**: the portal's `src/types/*` interfaces are the canonical response shapes — port them,
  don't redefine from scratch. (Project rule: types live in `types/<domain>.ts`, never inlined.)
- **Status/workflow**: reuse `statusTone()` and the workflow state machines in
  `ex_auto/setup/workflows.py` so mobile and web agree on what transitions are legal.

See [services.md](services.md) for the client patterns (toast-on-action, silent-on-read,
`useFetch` refresh semantics) worth replicating natively.

---

## 6. Suggested screen map

```
Today            → appointments for the day, branch-scoped; tap → Appointment detail → "Start Job Card"
Jobs             → my assigned job cards (list, status pills)
  Job detail     → checklist (tick), time log (start/stop), parts (log/requisition), photos, deliver+sign
Inspect          → new inspection (pick template) / my inspections
  Inspection     → checklist OK/Attention/Fail, photo capture per item, summary, sign-off
Parts            → quick requisition from floor; status of my requests
Lookup           → scan plate / search vehicle → history, warranty, odometer (read-only)
More             → theme toggle, profile, settings, sync status
```

---

## 7. Quick reference card

```
PRIMARY      signal red   light #E11D2A · dark #FF3F4C    oklch(0.585 0.215 27)
BG           concrete #F4F2EC / asphalt #0B0C0F
ACCENT       cyan #3FA9D6
STATUS       go #3DAE5A · warn #D99A1C · stop #E11D2A · info #3B82E6
FONTS        Atkinson Hyperlegible (UI) · Big Shoulders Display (titles/KPI) · JetBrains Mono (numbers)
RADIUS       12px base
NAV          always-dark control panel (#101216)
DEVICE       camera + signature are the reason it's mobile
```
