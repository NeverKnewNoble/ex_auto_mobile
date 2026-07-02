# Mobile App — Job Cards & Parts Requisition

This document specs the **mobile version** of the ExAuto portal for the two highest-traffic flows on the workshop floor: **Job Cards** and **Parts Requisitions**. It mirrors the desktop SPA (`portal/src`) so the mobile client is a 1:1 swap on the same Frappe backend — same doctypes, same whitelisted endpoints, same payload shapes.

Everything here is driven by the existing `ex_auto.api.*` endpoints. No new backend is required.

## How API calls work

Every call is a `POST` to:

```
POST /api/method/<dotted.path>
```

- `Content-Type: application/json`, `X-Requested-With: XMLHttpRequest`, and (outside dev) `X-Frappe-CSRF-Token: <window.csrf_token>`.
- Send the session cookie (`credentials: include`).
- Frappe wraps every response in `{ "message": <payload> }` — unwrap `message`.
- **Nested objects/arrays must be JSON-encoded as strings** inside the args body (the desktop `_client.ts` `serialize()` does this automatically). Booleans go over the wire as `1`/`0`.
- Errors come back with `_server_messages` (JSON-encoded array) or `exception`; surface the cleaned human message.

Two kinds of writes:

| Pattern | Endpoint | Use |
|---|---|---|
| Custom API method | `ex_auto.api.<module>.<fn>` | Lists, details, workflow actions, composed reads |
| Generic doc CRUD | `frappe.client.insert` / `set_value` / `save` / `delete` | Create / patch / replace / delete a record |

Generic CRUD shapes (used by create/edit forms):

```jsonc
// Create
POST /api/method/frappe.client.insert
{ "doc": { "doctype": "Job Card", "naming_series": "JC-.YYYY.-", ...fields } }

// Patch specific fields
POST /api/method/frappe.client.set_value
{ "doctype": "Job Card", "name": "JC-2026-0001", "fieldname": { ...changedFields } }

// Replace whole doc incl. child tables (omitted child rows are deleted)
POST /api/method/frappe.client.save
{ "doc": { "doctype": "Parts Requisition", "name": "PR-2026-0001", ...fields, "items": [...] } }

// Delete (raises LinkExistsError if referenced)
POST /api/method/frappe.client.delete
{ "doctype": "Parts Requisition", "name": "PR-2026-0001" }
```

---

# Part 1 — Job Cards

The Job Card is the heart of the app: a vehicle comes in, a job card opens, parts/labor/technicians/checklist hang off it, and it ends in an invoice + delivery. On mobile, the technician/advisor needs three screens: **List**, **Create**, and **Detail**.

## 1.1 Job Card — List screen

Fetch the paginated list and the per-status counts for the filter chips.

| Action | Endpoint | Args |
|---|---|---|
| List jobs | `ex_auto.api.job_cards.list_jobs` | `{ filters?, search?, limit=50, start=0, order_by="modified desc" }` |
| Status chip counts | `ex_auto.api.job_cards.status_counts` | `{ branch? }` |

`filters` accepts `{ status?: JobCardStatus | JobCardStatus[], branch?, priority? }`.

**Statuses:** `Draft` · `Approved` · `Scheduled` · `In Progress` · `Quality Check` · `Completed` · `Invoiced` · `Delivered` · `Cancelled`
**Priorities:** `Low` · `Medium` · `High` · `Urgent`

Each list row carries enough to render a card without a second fetch: `name`, `status`, `priority`, `customer_name`, `customer_mobile`, `make_model`, `license_plate`, `branch`, `primary_technician_name`, `expected_delivery_date`, `grand_total`, `modified`.

```jsonc
// Example: In-Progress + Quality Check jobs for one branch, searched
POST /api/method/ex_auto.api.job_cards.list_jobs
{ "filters": "{\"status\":[\"In Progress\",\"Quality Check\"],\"branch\":\"Accra Main\"}",
  "search": "hilux", "limit": 25, "start": 0 }
```

## 1.2 Job Card — Create screen

Create is a plain `frappe.client.insert` of doctype **Job Card** with `naming_series: "JC-.YYYY.-"`. Photos are uploaded **after** the doc exists (see §1.5).

### Required fields (validated client-side before submit)
`branch` · `customer` · `vehicle` · `customer_complaints`

### Full field list (mobile form)

| Section | Field | Type | Notes / picker source |
|---|---|---|---|
| **Job Details** | `posting_date` | date | defaults to today |
| | `expected_delivery_date` | date | optional |
| | `branch` *(req)* | link → Workshop Branch | picker: `branches.list_branches`; seed from Workshop Settings `default_branch` |
| | `priority` | select | `Low / Medium / High / Urgent` (default `Medium`) |
| | `service_advisor` | link → User (System User) | picker: `frappe.client.get_list` on `User` |
| | `primary_technician` | link → Technician | picker: `technicians.list_technicians` |
| | `service_estimate` | link → Service Estimate | optional; **cascades** customer/vehicle/branch/plate/make_model |
| **Customer** | `customer` *(req)* | link → Customer | picker: `search.search_customers`; fills mobile + email from meta |
| | `customer_mobile` | data (tel) | auto-filled from customer, editable |
| | `customer_email` | data (email) | auto-filled from customer, editable |
| **Vehicle** | `vehicle` *(req)* | link → Vehicle | picker: `search.list_customer_vehicles` (scoped to chosen customer); fills plate/make_model/odometer |
| | `license_plate` | data | display copy, editable |
| | `make_model` | data | display copy, editable |
| | `odometer_reading` | int (km) | from vehicle meta |
| | `fuel_level` | select | `'' / Empty / 1/4 / 1/2 / 3/4 / Full` |
| **Complaint & Diagnosis** | `customer_complaints` *(req)* | text | what the customer reported |
| | `diagnosis_summary` | text | filled by advisor |
| | `service_advisor_notes` | text | workshop-internal, not shown to customer |
| **Photos** | (file attachments) | image[] | uploaded post-save, see §1.5 |

### Picker endpoints used by the Create form

| Picker | Endpoint | Returns (value · label · meta) |
|---|---|---|
| Customer | `ex_auto.api.search.search_customers` `{ q, limit=10 }` | `name` · `customer_name` · `{ mobile_no, email_id }` |
| Vehicle (scoped) | `ex_auto.api.search.list_customer_vehicles` `{ customer }` | `name` · year/make/model · `{ license_plate, make_model, odometer_reading }` |
| Branch | `ex_auto.api.branches.list_branches` `{ search, limit=20 }` | `name` · `branch_name` · `branch_code/city` |
| Technician | `ex_auto.api.technicians.list_technicians` `{ search, limit=15 }` | `name` · `technician_name` · specialization/branch |
| Service Advisor (User) | `frappe.client.get_list` `{ doctype:"User", filters:{enabled:1,user_type:"System User"} }` | `name` · `full_name` · `email` |
| Estimate | `ex_auto.api.estimates.list_estimates` `{ search, limit=12 }` | `name` · `name` · `{ customer, vehicle, branch, license_plate, make_model }` |

### Create request

```jsonc
POST /api/method/frappe.client.insert
{ "doc": {
    "doctype": "Job Card",
    "naming_series": "JC-.YYYY.-",
    "posting_date": "2026-06-29",
    "expected_delivery_date": "2026-07-02",
    "branch": "Accra Main",
    "priority": "High",
    "service_advisor": "advisor@workshop.com",
    "primary_technician": "TECH-0007",
    "service_estimate": "EST-2026-0042",
    "customer": "CUST-0001",
    "customer_mobile": "+233 20 000 0000",
    "customer_email": "kojo@example.com",
    "vehicle": "VEH-0001",
    "license_plate": "GR-2451-21",
    "make_model": "Toyota Hilux 2021",
    "odometer_reading": 84210,
    "fuel_level": "1/2",
    "customer_complaints": "Brakes squealing, pulls left under braking.",
    "diagnosis_summary": "",
    "service_advisor_notes": ""
} }
// → { message: { name: "JC-2026-0001", ... } }
```

> **Edit** screen is the same form: load with `get_detail`, save changed fields with `frappe.client.set_value` (`{ doctype:"Job Card", name, fieldname:{...} }`). Parts, labor, technicians and checklist are **not** edited here — they're managed on the Detail screen tabs (§1.4).

## 1.3 Job Card — Detail screen (read)

One call returns the parent **plus all child tables** — no extra round-trips:

```
POST /api/method/ex_auto.api.job_cards.get_detail   { "name": "JC-2026-0001" }
```

Returns the full `JobCard` object:

- **Header / identity:** `name`, `status`, `priority`, `posting_date`, `expected_delivery_date`, `branch`, `service_advisor`, `customer`, `customer_name`, `customer_mobile`, `customer_email`, `vehicle`, `license_plate`, `make_model`, `odometer_reading`, `fuel_level`
- **Complaint:** `customer_complaints`, `diagnosis_summary`, `service_advisor_notes`
- **Technician:** `primary_technician`, `primary_technician_name`
- **Child tables:**
  - `technicians[]` — `{ technician, technician_name, role, is_primary, allocated_hours, actual_hours }`
  - `parts[]` — `{ item_code, item_name, qty, actual_qty_used?, uom, rate, amount, warehouse, is_reserved, is_issued }`
  - `labor_items[]` — `{ service_type, service_name, estimated_hours, actual_hours, rate, amount, technician?, status }`
  - `checklist[]` — `{ checklist_item, category, is_mandatory, result, remarks? }`
  - `time_logs[]` — `{ technician, technician_name, operation, from_time, to_time?, duration_hours, billable }`
  - `parts_requisitions[]` — linked requisitions: `{ name, status, requested_at, is_urgent, total_amount, warehouse?, approved_at?, issued_at?, stock_entry?, modified? }`
  - `parts_returns[]` — linked returns: `{ name, status, return_date, return_reason, stock_entry?, credit_note?, ... }`
- **Totals:** `parts_total`, `labor_total`, `discount_amount`, `tax_amount`, `grand_total`, `rounded_total?`
- **Lifecycle stamps:** `started_at`, `completed_at`, `qc_passed_at`, `delivered_at`, `qc_inspector`, `qc_remarks`
- **Links:** `service_estimate?`, `appointment?`, `sales_invoice?`, `warranty_claim?`, `customer_signature?`, `delivery_acknowledgment?`

Suggested mobile tabs: **Overview** (header + complaint + totals) · **Parts** · **Labor** · **Team** · **Checklist** · **Time** · **Requisitions/Returns**.

## 1.4 Job Card — Detail actions (write)

### Workflow / status transitions

| Action | Endpoint | Args |
|---|---|---|
| Generic workflow transition | `ex_auto.api.job_cards.apply_action` | `{ name, action }` — actions: `Approve, Schedule, Start Work, Send to QC, Pass QC, Mark Invoiced, Deliver, Cancel, Reopen` |
| Force status | `ex_auto.api.job_cards.set_status` | `{ name, new_status }` |
| Start work | `ex_auto.api.job_cards.start_work` | `{ name }` |
| Submit for QC | `ex_auto.api.job_cards.submit_for_qc` | `{ name }` |
| Pass QC | `ex_auto.api.job_cards.pass_qc` | `{ name, remarks? }` |
| Fail QC | `ex_auto.api.job_cards.fail_qc` | `{ name, remarks }` *(required)* |
| Create Sales Invoice | `ex_auto.api.job_cards.create_sales_invoice` | `{ name }` → `{ invoice }` |
| Mark delivered | `ex_auto.api.job_cards.mark_delivered` | `{ name, signature?, acknowledgment? }` |

### Child-table edits (in-place from Detail tabs)

| Action | Endpoint | Args |
|---|---|---|
| Add technician | `ex_auto.api.job_cards.add_technician` | `{ name, technician, role?, is_primary(0/1), allocated_hours? }` |
| Add labor item | `ex_auto.api.job_cards.add_labor_item` | `{ name, service_type, estimated_hours?, technician?, rate?, status? }` |
| Update labor status | `ex_auto.api.job_cards.update_labor_status` | `{ name, idx, status, actual_hours? }` |
| Add checklist item | `ex_auto.api.job_cards.add_checklist_item` | `{ name, checklist_item, category?, is_mandatory(0/1), remarks? }` |
| Load checklist from template | `ex_auto.api.job_cards.add_checklist_from_template` | `{ name, template }` |
| Update checklist item | `ex_auto.api.job_cards.update_checklist_item` | `{ name, idx, result, remarks? }` |
| Add time log | `ex_auto.api.job_cards.add_time_log` | `{ name, operation, from_time, to_time, technician?, notes?, billable(0/1) }` |
| **Request parts** | `ex_auto.api.job_cards.request_parts` | `{ name, items, notes?, is_urgent(0/1) }` → `{ requisition }` |

### Request Parts dialog (the desktop "fetch all details" flow)

From the Job Card Detail screen, the technician requests parts. The item picker fetches stock parts and pre-fills UoM + rate from item meta, exactly like desktop:

1. **Part picker** — `ex_auto.api.search.search_items` with `stock_item=1` (physical inventory only):
   ```jsonc
   POST /api/method/ex_auto.api.search.search_items
   { "q": "brake pad", "limit": 12, "stock_item": 1 }
   // → [{ name, item_code, item_name, stock_uom, standard_rate, is_stock_item }]
   ```
   Selecting an item fills the row's `uom` from `stock_uom` and `rate` from `standard_rate`.

2. **Submit** the requisition through the Job Card (this creates a linked Parts Requisition for the store keeper):
   ```jsonc
   POST /api/method/ex_auto.api.job_cards.request_parts
   { "name": "JC-2026-0001",
     "items": "[{\"item_code\":\"BRK-PAD-FRT\",\"qty\":1,\"uom\":\"Set\"},{\"item_code\":\"BRK-FLUID\",\"qty\":2,\"uom\":\"Ltr\"}]",
     "notes": "Front axle only",
     "is_urgent": 1 }
   // → { message: { requisition: "PR-2026-0001" } }
   ```

After this returns, the new requisition shows up in the job's `parts_requisitions[]` on the next `get_detail`, and the store keeper fulfils it (Part 2). The `request_parts` item shape is `{ item_code, qty, uom?, warehouse? }`.

## 1.5 Job Card — Photos

Photos are **not** a JSON field — they're Frappe File attachments. Upload each **after** the job card exists so it attaches to the right parent:

```jsonc
// multipart/form-data to the Frappe upload endpoint
POST /api/method/upload_file
file: <binary>
doctype: "Job Card"
docname: "JC-2026-0001"
optimize: 1
is_private: 1
```

Upload sequentially with a per-file progress counter (keeps the UI honest on a flaky workshop connection). On create: upload after `insert` returns the new `name`; on edit: upload against the existing id.

---







# Part 2 — Parts Requisition

A Parts Requisition is the store-keeper's pick list: a job needs parts → a requisition lists them → the store keeper checks stock, approves, and issues. It is **reserve-only** — stock is relieved at invoice submit, not here. Mobile needs **List**, **Create**, and **Detail** screens (same shape as Job Cards).

Two ways a requisition is born:
1. **From a Job Card** — `job_cards.request_parts` (§1.4). Fastest for technicians.
2. **Standalone Create** — `frappe.client.insert` of doctype **Parts Requisition** (this section). Used by the store keeper / advisor directly.

## 2.1 Requisition — List screen

| Action | Endpoint | Args |
|---|---|---|
| List requisitions | `ex_auto.api.parts.list_requisitions` | `{ filters?, search?, urgent_only=false, limit=50, start=0, order_by="requested_at desc" }` |
| Status chip counts | `ex_auto.api.parts.requisition_status_counts` | `{}` → per-status + `All` + `Urgent` |
| Store-keeper dashboard | `ex_auto.api.parts.store_keeper_summary` | `{}` → `{ open_requisitions, urgent_requisitions, awaiting_issue, short_lines, pending_returns }` |

`filters` accepts `{ status?, branch?, job_card?, warehouse?, requested_by? }`.
**Statuses:** `Draft` · `Pending` · `Approved` · `Issued` · `Partially Issued` · `Cancelled`

List rows carry `items_count` and `short_count` (lines where available < needed) so the list can flag backorders without opening the detail.

```jsonc
// Urgent, not-yet-issued requisitions
POST /api/method/ex_auto.api.parts.list_requisitions
{ "urgent_only": 1, "filters": "{\"status\":[\"Pending\",\"Approved\"]}", "limit": 25 }
```

## 2.2 Requisition — Create screen

Create is `frappe.client.insert` of doctype **Parts Requisition** with `naming_series: "PR-.YYYY.-"`. **Pricing and availability are filled later** by the store keeper — the create form only needs item codes + quantities.

### Required fields
`job_card` · at least one item line with `item_code` + `qty > 0`

### Header fields

| Field | Type | Notes / picker |
|---|---|---|
| `job_card` *(req)* | link → Job Card | picker: `job_cards.list_jobs`; **cascades** `branch` from job meta |
| `branch` | link → Workshop Branch | picker: `branches.list_branches`; seed from Workshop Settings `default_branch` |
| `warehouse` | link → Warehouse | source warehouse; picker: `frappe.client.get_list` on `Warehouse` (leaf only); seed from `default_warehouse` |
| `is_urgent` | bool | flag for immediate pick |
| `notes` | text | why these parts / special handling |

### Item line fields (child table `items[]`)

Each line: `{ item_code, qty, uom (default "Nos"), warehouse }`. The form sends a fuller row shape on insert (the rest are placeholders the store keeper recomputes):

```jsonc
{ "item_code": "BRK-PAD-FRT", "item_name": "BRK-PAD-FRT", "qty": 1,
  "uom": "Set", "rate": 0, "amount": 0, "available_qty": 0,
  "is_issued": false, "warehouse": "Stores - AM" }
```

### Picker endpoints used by the Create form

| Picker | Endpoint | Notes |
|---|---|---|
| Job Card | `ex_auto.api.job_cards.list_jobs` `{ search, limit=12 }` | meta carries `branch` for cascade |
| Branch | `ex_auto.api.branches.list_branches` `{ search, limit=20 }` | |
| Warehouse | `frappe.client.get_list` `{ doctype:"Warehouse", fields:["name","warehouse_name","company"], filters:{is_group:0,disabled:0}, or_filters:[["name","like","%q%"],["warehouse_name","like","%q%"]], order_by:"warehouse_name asc", limit_page_length:20 }` | leaf warehouses only — group warehouses can't hold stock |
| Item | `ex_auto.api.search.search_items` `{ q, limit:12 }` | (or `stock_item:1` to restrict to physical inventory) |

### Create request

```jsonc
POST /api/method/frappe.client.insert
{ "doc": {
    "doctype": "Parts Requisition",
    "naming_series": "PR-.YYYY.-",
    "job_card": "JC-2026-0001",
    "branch": "Accra Main",
    "warehouse": "Stores - AM",
    "is_urgent": false,
    "notes": "Front axle brake job",
    "items": [
      { "item_code": "BRK-PAD-FRT", "item_name": "BRK-PAD-FRT", "qty": 1,
        "uom": "Set", "rate": 0, "amount": 0, "available_qty": 0,
        "is_issued": false, "warehouse": "Stores - AM" },
      { "item_code": "BRK-FLUID", "item_name": "BRK-FLUID", "qty": 2,
        "uom": "Ltr", "rate": 0, "amount": 0, "available_qty": 0,
        "is_issued": false, "warehouse": "Stores - AM" }
    ]
} }
// → { message: { name: "PR-2026-0001", ... } }
```

> **Edit** uses `frappe.client.set_value` for header fields, or `frappe.client.save` (full doc incl. `items[]`) when adding/removing lines — omitted child rows are deleted on `save`.

## 2.3 Requisition — Detail screen (read)

```
POST /api/method/ex_auto.api.parts.get_requisition   { "name": "PR-2026-0001" }
```

Returns the full requisition + items + a computed **readiness** block:

- **Header:** `name`, `status`, `requested_at`, `job_card?`, `branch`, `requested_by`, `requested_by_name?`, `warehouse`, `is_urgent`, `total_amount`, `notes?`
- **Approval / issue stamps:** `approved_by?`, `approved_by_name?`, `approved_at?`, `issued_by?`, `issued_by_name?`, `issued_at?`, `stock_entry?`
- **`items[]`** — each: `{ item_code, item_name, description?, qty, uom, rate, amount, available_qty, is_issued, warehouse? }`
- **`readiness`** — `{ total, issued, ready, short }`

Per-line state the mobile detail should render (derived, matches desktop):
- **Issued** — `is_issued === true`
- **Ready to pick** — `available_qty >= qty && !is_issued`
- **Backorder / short** — `available_qty < qty && !is_issued` (short qty = `max(0, qty - available_qty)`)

### Live stock check (the desktop "fetch availability" flow)

The store keeper checks current stock on demand. This is what fills `available_qty`:

```jsonc
POST /api/method/ex_auto.api.parts.get_item_availability
{ "items": "[{\"item_code\":\"BRK-PAD-FRT\",\"warehouse\":\"Stores - AM\"},{\"item_code\":\"BRK-FLUID\"}]",
  "warehouse": "Stores - AM" }
// → [{ item_code, warehouse, available_qty, reserved_qty?, uom? }]
```

`items` may be a list of `{ item_code, warehouse? }` objects or a bare array of `item_code` strings; the top-level `warehouse` is the fallback for lines without their own.

## 2.4 Requisition — Detail actions (write)

| Action | Endpoint | Args | Notes |
|---|---|---|---|
| Submit (Draft → Pending) | `ex_auto.api.parts.apply_requisition_action` | `{ name, action:"Submit" }` | |
| Approve | `ex_auto.api.parts.approve_requisition` | `{ name }` | or `apply_requisition_action` with `action:"Approve"` |
| Issue all | `ex_auto.api.parts.mark_issued` | `{ name, stock_entry? }` | optional Stock Entry link |
| Partial issue | `ex_auto.api.parts.apply_requisition_action` | `{ name, action:"Partial Issue" }` | issues available lines, rest stay short |
| Cancel | `ex_auto.api.parts.cancel_requisition` | `{ name }` | or `apply_requisition_action` `action:"Cancel"`; already-issued items aren't reversed |
| Delete | `frappe.client.delete` | `{ doctype:"Parts Requisition", name }` | refused if a Stock Entry exists against it |

**Workflow actions** (for `apply_requisition_action`): `Submit` · `Approve` · `Issue` · `Partial Issue` · `Cancel`. Each returns the updated parent document.

```jsonc
// Approve, then issue with a Stock Entry reference
POST /api/method/ex_auto.api.parts.approve_requisition   { "name": "PR-2026-0001" }
POST /api/method/ex_auto.api.parts.mark_issued           { "name": "PR-2026-0001", "stock_entry": "STE-2026-0099" }
```

## 2.5 Lifecycle at a glance

```
Job Card ──request_parts──▶ Parts Requisition (Draft)
                                  │ Submit
                                  ▼
                               Pending ──Approve──▶ Approved
                                                       │ Issue / Partial Issue
                                                       ▼
                                          Issued / Partially Issued
                                  (stock reserved; relieved at Sales Invoice submit)
```

Billing context: Estimate → Sales Order → Sales Invoice (`update_stock`). The Parts Requisition only **reserves**; stock is physically relieved when the invoice is submitted. See the parent billing pipeline docs for the full chain.

---

## Appendix — endpoint quick reference

### Job Cards (`ex_auto.api.job_cards`)
`list_jobs` · `status_counts` · `get_detail` · `apply_action` · `set_status` · `start_work` · `submit_for_qc` · `pass_qc` · `fail_qc` · `create_sales_invoice` · `mark_delivered` · `add_time_log` · `add_technician` · `add_labor_item` · `update_labor_status` · `add_checklist_item` · `add_checklist_from_template` · `update_checklist_item` · `request_parts`

### Parts Requisitions (`ex_auto.api.parts`)
`list_requisitions` · `requisition_status_counts` · `get_requisition` · `store_keeper_summary` · `get_item_availability` · `apply_requisition_action` · `approve_requisition` · `mark_issued` · `cancel_requisition`

### Pickers / typeahead (`ex_auto.api.search` + `frappe.client.get_list`)
`search_customers` · `list_customer_vehicles` · `search_items` (`stock_item=1` for parts) · `search_service_types` · `branches.list_branches` · `technicians.list_technicians` · `job_cards.list_jobs` · `estimates.list_estimates` · `get_list` on `User` / `Warehouse`

### Generic CRUD (`frappe.client`)
`insert` · `set_value` · `save` · `delete` · `upload_file` (multipart, for Job Card photos)

See [api.md](api.md) for the full backend surface and [doctypes.md](doctypes.md) for field definitions.







# Part 3 — Inspections

An Inspection Report is a checklist run against a vehicle — at intake (Pre-service), during the job (Quality Control), before handover (Pre-delivery), or for insurance/safety. Each item gets a Pass / Attention / Fail result, optionally with a photo and severity. Inspections usually hang off a Job Card but can stand alone. Mobile needs **List**, **Create**, and **Detail** screens — the Detail screen is where the inspector actually works through the checklist on the floor.

The doctype is **Inspection Report** (`naming_series: "INS-.YYYY.-"`).

## 3.1 Inspection — List screen

| Action | Endpoint | Args |
|---|---|---|
| List inspections | `ex_auto.api.inspections.list_inspections` | `{ filters?, search?, limit=50, start=0, order_by="inspection_date desc, modified desc" }` |
| Status chip counts | `ex_auto.api.inspections.status_counts` | `{ branch? }` |

`filters` accepts `{ status?, branch?, inspection_type? }`.

**Statuses:** `Draft` · `In Progress` · `Completed` · `Failed` · `Cancelled`
**Types:** `Pre-service` · `Quality Control` · `Pre-delivery` · `Insurance` · `Safety` · `General`

Each row carries: `name`, `status`, `inspection_type`, `inspection_date`, `job_card?`, `vehicle`, `license_plate`, `make_model`, `inspector_name`, `branch`, `overall_result?`, `items_pass`, `items_fail`, `items_attention`.

```jsonc
// Quality Control inspections, in progress, one branch
POST /api/method/ex_auto.api.inspections.list_inspections
{ "filters": "{\"inspection_type\":\"Quality Control\",\"status\":\"In Progress\"}", "limit": 25 }
```

## 3.2 Inspection — Create screen

Create is `frappe.client.insert` of doctype **Inspection Report** with `naming_series: "INS-.YYYY.-"`. Picking a checklist template loads the items; the inspector fills results on the Detail screen.

### Required fields
`vehicle` · `inspection_date`

> `inspector` defaults to the logged-in user server-side if left empty — the create form drops `inspector`/`inspector_name` from the payload when blank.

### Full field list (mobile form)

| Field | Type | Notes / picker source |
|---|---|---|
| `inspection_type` *(req)* | select | `Pre-service / Quality Control / Pre-delivery / Insurance / Safety / General` (default `Pre-service`) |
| `inspection_date` *(req)* | date | defaults to today |
| `branch` | link → Workshop Branch | picker: `branches.list_branches`; seed from Workshop Settings `default_branch` |
| `job_card` | link → Job Card | optional; **cascades** vehicle/branch/plate from job meta |
| `inspector` | link → User (System User) | picker: `frappe.client.get_list` on `User`; defaults to you |
| `checklist_template` | link → Vehicle Checklist Template | optional — loads the checklist items |
| `vehicle` *(req)* | link → Vehicle | picker: `vehicles.list_vehicles` (search by plate/model) |
| `license_plate` | data | display copy from vehicle, editable |
| `odometer_reading` | int (km) | |
| `summary` | text | free-form initial notes |

### Picker endpoints used by the Create form

| Picker | Endpoint | Notes |
|---|---|---|
| Branch | `ex_auto.api.branches.list_branches` `{ search, limit=20 }` | |
| Job Card | `ex_auto.api.job_cards.list_jobs` `{ search, limit=12 }` | meta carries `vehicle`, `branch`, `license_plate`, `make_model` for cascade |
| Inspector (User) | `frappe.client.get_list` `{ doctype:"User", filters:{enabled:1,user_type:"System User"} }` | |
| Checklist Template | `frappe.client.get_list` `{ doctype:"Vehicle Checklist Template", filters:{is_active:1}, order_by:"template_name asc" }` | optionally scope by `applies_to` |
| Vehicle | `ex_auto.api.vehicles.list_vehicles` `{ search, limit=15 }` | fills `license_plate`, `make_model`, `odometer_reading` |

### Create request

```jsonc
POST /api/method/frappe.client.insert
{ "doc": {
    "doctype": "Inspection Report",
    "naming_series": "INS-.YYYY.-",
    "inspection_type": "Quality Control",
    "inspection_date": "2026-06-29",
    "branch": "Accra Main",
    "job_card": "JC-2026-0001",
    "vehicle": "VEH-0001",
    "license_plate": "GR-2451-21",
    "odometer_reading": 84210,
    "checklist_template": "QC - Brake Job",
    "summary": "Post-repair QC after front brake service."
} }
// → { message: { name: "INS-2026-0001", ... } }
```

### Shortcut: create directly from a Job Card

From the Job Card Detail screen you can spawn an inspection pre-linked to the job (and optionally pre-load a template). This is the fastest path for QC on the floor:

```jsonc
POST /api/method/ex_auto.api.inspections.create_for_job_card
{ "job_card": "JC-2026-0001", "inspection_type": "Quality Control", "template": "QC - Brake Job" }
// → "INS-2026-0001"
```

Before creating, check whether one already exists so you deep-link instead of duplicating:

```jsonc
POST /api/method/ex_auto.api.inspections.find_for_job_card
{ "job_card": "JC-2026-0001", "inspection_type": "Quality Control" }
// → { name, status, inspection_type, docstatus }  |  null
```

> **Edit** uses `frappe.client.set_value` on the header. Frappe refuses edits once the report is submitted (`docstatus=1`).

## 3.3 Inspection — Detail screen (read)

```
POST /api/method/ex_auto.api.inspections.get_detail   { "name": "INS-2026-0001" }
```

Returns the full Inspection + items + photos + a computed **progress** block:

- **Header:** `name`, `status`, `inspection_type`, `inspection_date`, `job_card?`, `vehicle`, `license_plate`, `make_model`, `inspector`, `inspector_name`, `branch`, `odometer_reading?`, `checklist_template?`
- **Result rollup:** `overall_result?` (`Pass` / `Pass with notes` / `Fail`), `items_pass`, `items_fail`, `items_attention`, `summary?`, `completed_at?`
- **`items[]`** — each: `{ checklist_item, category, is_mandatory, result, severity?, remarks?, photo? }`
  - `result`: `Pending` / `OK` / `Attention` / `Failed` / `Not Applicable`
  - `severity`: `Low` / `Medium` / `High` / `Critical`
- **`photos[]`** — `{ caption, thumb_color }`
- **`progress`** — `{ total, completed }`
- **Sign-off:** `customer_signature?`, `inspector_signature?` (File URLs)

Completed count for the progress bar = `items_pass + items_fail + items_attention`.

## 3.4 Inspection — Detail actions (write)

| Action | Endpoint | Args |
|---|---|---|
| Workflow transition | `ex_auto.api.inspections.apply_action` | `{ name, action }` — actions: `Start Inspection`, `Mark Pass`, `Mark Fail`, `Cancel` |
| Update a checklist item | `ex_auto.api.inspections.update_item` | `{ name, idx, result, remarks?, severity?, photo? }` |
| Load template into report | `ex_auto.api.inspections.load_template` | `{ name, template }` |
| Submit report | `ex_auto.api.inspections.submit_report` | `{ name }` → `{ name, status, docstatus, already_submitted? }` |
| Create Job Card from inspection | `ex_auto.api.inspections.create_job_card_from_inspection` | `{ name }` → Job Card name (idempotent — re-calls return the same JC) |

> **Submit** goes through `submit_report` (not `frappe.client.submit`) so the doc is reloaded server-side — this avoids Frappe's optimistic-concurrency error when checklist items were updated after the detail screen was opened.

```jsonc
// Inspector works an item, then submits
POST /api/method/ex_auto.api.inspections.update_item
{ "name": "INS-2026-0001", "idx": 3, "result": "Attention",
  "severity": "Medium", "remarks": "Pad wear at 30% — flag for next service" }

POST /api/method/ex_auto.api.inspections.submit_report   { "name": "INS-2026-0001" }
```

Item photos: upload via `upload_file` (multipart, `doctype:"Inspection Report"`, `docname:<name>`) then pass the returned File URL as `photo` to `update_item`.

## 3.5 Inspection lifecycle at a glance

```
Draft ──Start Inspection──▶ In Progress ──(fill items)──▶ Submit
                                              │
                                  Mark Pass ──┴── Mark Fail
                                     ▼               ▼
                                 Completed         Failed
```

---








# Part 4 — Dashboard

The dashboard is the workshop's at-a-glance home screen. On mobile, prioritise the **live floor** and the **today** numbers — the rest of the desktop panels (branch load, top techs, pipeline) are secondary. Every endpoint is a silent read and accepts an optional `branch` to scope to one location.

## 4.1 One-shot load vs. per-panel refresh

| Action | Endpoint | Args | Use |
|---|---|---|---|
| Full snapshot | `ex_auto.api.dashboard.snapshot` | `{ branch? }` | First load — all panels in one round-trip |
| Primary KPIs | `ex_auto.api.dashboard.kpis_primary` | `{ branch? }` | Refresh the top number cards |
| Workshop floor (live) | `ex_auto.api.dashboard.workshop_floor_live` | `{ limit=6, branch? }` | Refresh the live job list |
| Today's pulse | `ex_auto.api.dashboard.today_pulse` | `{ branch? }` | Refresh today's appointments/estimates/reminders |
| Secondary KPIs | `ex_auto.api.dashboard.kpis_secondary` | `{ branch? }` | Pipeline / warranty / parts-short / AMC |
| Job status mix | `ex_auto.api.dashboard.status_mix` | `{ branch? }` | Status breakdown donut |
| Attention feed | `ex_auto.api.dashboard.attention_feed` | `{ limit=8 }` | Alerts — poll ~every 30s |

**Mobile pattern:** call `snapshot` once on screen mount, then refetch `kpis_primary` + `workshop_floor_live` + `today_pulse` on pull-to-refresh (and `attention_feed` on a short poll).

```jsonc
POST /api/method/ex_auto.api.dashboard.snapshot   { "branch": "Accra Main" }
// → { kpis_primary, kpis_secondary, workshop_floor_live, today_pulse,
//     status_mix, branch_load, top_technicians, attention_feed }
```

## 4.2 Jobs on Floor count + Today's Appointments count (Primary KPIs)

```
POST /api/method/ex_auto.api.dashboard.kpis_primary   { "branch": "Accra Main" }
```

Returns the headline number cards:

| Field | Card | Meaning |
|---|---|---|
| `jobs_on_floor` | **Jobs on Floor** | Active job cards currently being worked |
| `today_appointments` | **Today's Appointments** | Count of appointments booked for today |
| `appointments_unconfirmed` | (sub-stat) | Of today's, how many are still unconfirmed |
| `bay_utilization_pct` | **Bay Utilisation** | `bay_load / bay_capacity` as a % |
| `bay_load` / `bay_capacity` | (sub-stat) | Bays in use / total bays |
| `revenue_mtd` | **Revenue MTD** | Month-to-date revenue |

```jsonc
// → { jobs_on_floor: 12, today_appointments: 8, appointments_unconfirmed: 3,
//     bay_utilization_pct: 75, bay_load: 6, bay_capacity: 8, revenue_mtd: 48250 }
```

For the mobile home screen the two headline tiles map directly to `jobs_on_floor` and `today_appointments`. Tapping **Jobs on Floor** should deep-link to the Job Cards list filtered to active statuses (§1.1); tapping **Today's Appointments** to the appointments list filtered to today (§4.4).

## 4.3 Workshop Floor Live

The live list of jobs actively on the floor, sorted by priority + ETA:

```
POST /api/method/ex_auto.api.dashboard.workshop_floor_live   { "limit": 6, "branch": "Accra Main" }
```

Returns `FloorLiveJob[]` — each row is a lightweight job card built for a compact mobile tile:

| Field | Notes |
|---|---|
| `name` | Job Card id — deep-link target (`/jobs/{name}`, §1.3) |
| `status` | Job Card status (drives the colour chip) |
| `priority` | `Low / Medium / High / Urgent` — drives sort + accent |
| `make_model` | vehicle |
| `license_plate` | vehicle plate |
| `primary_technician_name` | who's on it |
| `expected_delivery_date` | ETA |

```jsonc
// → [ { name:"JC-2026-0001", status:"In Progress", priority:"Urgent",
//       make_model:"Toyota Hilux 2021", license_plate:"GR-2451-21",
//       primary_technician_name:"Kwame A.", expected_delivery_date:"2026-06-30" }, … ]
```

Each tile taps through to the Job Card Detail screen. Refetch on pull-to-refresh; `limit` controls how many tiles the mobile home shows (6 is a good default).

## 4.4 Today's Appointments (the list)

The KPI in §4.2 is the *count*; for the **list** of today's appointments use the dashboard's Today's Pulse (top few) or the Appointments list endpoint (full list).

### Quick: top appointments from the dashboard pulse

```
POST /api/method/ex_auto.api.dashboard.today_pulse   { "branch": "Accra Main" }
```

Returns `{ appointments[], estimates[], reminders[] }`. The `appointments[]` rows (`PulseAppointment`) are trimmed for display:

`{ name, status, appointment_time, customer_name, license_plate, service_name? }`

### Full: the appointments list scoped to today

For the complete, filterable list (and the today count counterpart) use the Appointments module:

| Action | Endpoint | Args |
|---|---|---|
| List today's appointments | `ex_auto.api.appointments.list_appointments` | `{ filters:{ appointment_date:"<today>", branch? }, order_by:"appointment_time asc" }` |
| Today summary (counts by status) | `ex_auto.api.appointments.today_summary` | `{ branch? }` → `{ date, total, by_status, confirmed, pending, in_progress, completed }` |

```jsonc
POST /api/method/ex_auto.api.appointments.list_appointments
{ "filters": "{\"appointment_date\":\"2026-06-29\",\"branch\":\"Accra Main\"}",
  "order_by": "appointment_time asc", "limit": 50 }
```

Each appointment row carries: `name`, `status`, `appointment_date`, `appointment_time`, `end_time`, `customer_name`, `customer_mobile`, `license_plate`, `make_model`, `service_name`/`services_summary`, `primary_technician_name`, `job_card?`.

**Appointment statuses:** `Pending` · `Confirmed` · `In Progress` · `Completed` · `Cancelled` · `No Show`

### Per-row actions (from the appointment tile)

| Action | Endpoint | Args |
|---|---|---|
| Confirm | `ex_auto.api.appointments.confirm` | `{ name }` |
| Start visit | `ex_auto.api.appointments.start_visit` | `{ name }` |
| Complete | `ex_auto.api.appointments.complete` | `{ name }` |
| Cancel | `ex_auto.api.appointments.cancel` | `{ name, reason? }` |
| Mark no-show | `ex_auto.api.appointments.mark_no_show` | `{ name, reason? }` |

`start_visit` is the bridge from the dashboard to the floor — it moves the appointment to In Progress and is typically followed by opening a Job Card for the vehicle (§1.2).

## 4.5 Dashboard data shapes (reference)

```
PrimaryKpis   { jobs_on_floor, today_appointments, appointments_unconfirmed,
                bay_utilization_pct, bay_load, bay_capacity, revenue_mtd }
FloorLiveJob  { name, status, priority, make_model?, license_plate?,
                primary_technician_name?, expected_delivery_date? }
TodayPulse    { appointments: PulseAppointment[], estimates: PulseEstimate[],
                reminders: PulseReminder[] }
TodaySummary  { date, total, by_status, confirmed, pending, in_progress, completed }
```

---




























# Part 5 — Complete field → API URL map

Everything above, flattened. This part lists **every part, every section, and every field**, and the **exact full API URL** the mobile client calls for it. All URLs are `POST` and follow the rules in [How API calls work](#how-api-calls-work) (CSRF header, session cookie, `{ message }` envelope, JSON-stringified nested args).

Legend for the **API URL** column:
- A **link/picker** field calls its typeahead URL while the user searches, then stores the chosen `name` on the parent doc — the parent is persisted by the screen's own create/save URL.
- A **plain** field (data/text/date/select/number) is not its own call — it rides along in the screen's create (`frappe.client.insert`) or save (`frappe.client.set_value` / `frappe.client.save`) request. Its "API URL" is therefore the screen's write URL.
- A **read** field is delivered by the screen's detail/list URL.

---

## Part 1 — Job Cards · field map

### §1.1 List screen
| Element | Full API URL |
|---|---|
| Job list | `POST /api/method/ex_auto.api.job_cards.list_jobs` |
| Status chip counts | `POST /api/method/ex_auto.api.job_cards.status_counts` |
| Every list-row field (`name`, `status`, `priority`, `customer_name`, `customer_mobile`, `make_model`, `license_plate`, `branch`, `primary_technician_name`, `expected_delivery_date`, `grand_total`, `modified`) | delivered by `…job_cards.list_jobs` |

### §1.2 Create screen — write URL: `POST /api/method/frappe.client.insert` · edit: `POST /api/method/frappe.client.set_value`
| Section | Field | Kind | API URL it needs |
|---|---|---|---|
| Job Details | `posting_date` | date | rides in `…frappe.client.insert` |
| Job Details | `expected_delivery_date` | date | rides in `…frappe.client.insert` |
| Job Details | `branch` *(req)* | link | picker `POST /api/method/ex_auto.api.branches.list_branches` |
| Job Details | `priority` | select | rides in `…frappe.client.insert` |
| Job Details | `service_advisor` | link → User | picker `POST /api/method/frappe.client.get_list` `{doctype:"User"}` |
| Job Details | `primary_technician` | link | picker `POST /api/method/ex_auto.api.technicians.list_technicians` |
| Job Details | `service_estimate` | link | picker `POST /api/method/ex_auto.api.estimates.list_estimates` |
| Customer | `customer` *(req)* | link | picker `POST /api/method/ex_auto.api.search.search_customers` |
| Customer | `customer_mobile` | data | rides in `…frappe.client.insert` (auto-filled from customer picker meta) |
| Customer | `customer_email` | data | rides in `…frappe.client.insert` (auto-filled from customer picker meta) |
| Vehicle | `vehicle` *(req)* | link | picker `POST /api/method/ex_auto.api.search.list_customer_vehicles` |
| Vehicle | `license_plate` | data | rides in `…frappe.client.insert` (auto-filled from vehicle meta) |
| Vehicle | `make_model` | data | rides in `…frappe.client.insert` (auto-filled from vehicle meta) |
| Vehicle | `odometer_reading` | number | rides in `…frappe.client.insert` |
| Vehicle | `fuel_level` | select | rides in `…frappe.client.insert` |
| Complaint | `customer_complaints` *(req)* | text | rides in `…frappe.client.insert` |
| Complaint | `diagnosis_summary` | text | rides in `…frappe.client.insert` |
| Complaint | `service_advisor_notes` | text | rides in `…frappe.client.insert` |
| Photos | photo attachments | file[] | `POST /api/method/upload_file` (multipart, after insert) |

### §1.3 Detail screen (read) — `POST /api/method/ex_auto.api.job_cards.get_detail`
Every header, complaint, technician, totals, lifecycle and link field, plus the child tables `technicians[]`, `parts[]`, `labor_items[]`, `checklist[]`, `time_logs[]`, `parts_requisitions[]`, `parts_returns[]` — all delivered by `…job_cards.get_detail`.

### §1.4 Detail actions (write)
| Action | Full API URL |
|---|---|
| Workflow transition | `POST /api/method/ex_auto.api.job_cards.apply_action` |
| Force status | `POST /api/method/ex_auto.api.job_cards.set_status` |
| Start work | `POST /api/method/ex_auto.api.job_cards.start_work` |
| Submit for QC | `POST /api/method/ex_auto.api.job_cards.submit_for_qc` |
| Pass QC | `POST /api/method/ex_auto.api.job_cards.pass_qc` |
| Fail QC | `POST /api/method/ex_auto.api.job_cards.fail_qc` |
| Create Sales Invoice | `POST /api/method/ex_auto.api.job_cards.create_sales_invoice` |
| Mark delivered | `POST /api/method/ex_auto.api.job_cards.mark_delivered` |
| Add technician | `POST /api/method/ex_auto.api.job_cards.add_technician` |
| Add labor item | `POST /api/method/ex_auto.api.job_cards.add_labor_item` |
| Update labor status | `POST /api/method/ex_auto.api.job_cards.update_labor_status` |
| Add checklist item | `POST /api/method/ex_auto.api.job_cards.add_checklist_item` |
| Load checklist from template | `POST /api/method/ex_auto.api.job_cards.add_checklist_from_template` |
| Update checklist item | `POST /api/method/ex_auto.api.job_cards.update_checklist_item` |
| Add time log | `POST /api/method/ex_auto.api.job_cards.add_time_log` |
| Request parts — part picker | `POST /api/method/ex_auto.api.search.search_items` `{stock_item:1}` |
| Request parts — submit | `POST /api/method/ex_auto.api.job_cards.request_parts` |

### §1.5 Photos
| Action | Full API URL |
|---|---|
| Upload each photo (after insert) | `POST /api/method/upload_file` (multipart) |

---

## Part 2 — Parts Requisition · field map

### §2.1 List screen
| Element | Full API URL |
|---|---|
| Requisition list | `POST /api/method/ex_auto.api.parts.list_requisitions` |
| Status chip counts | `POST /api/method/ex_auto.api.parts.requisition_status_counts` |
| Store-keeper dashboard | `POST /api/method/ex_auto.api.parts.store_keeper_summary` |
| Every list-row field (incl. `items_count`, `short_count`) | delivered by `…parts.list_requisitions` |

### §2.2 Create screen — write URL: `POST /api/method/frappe.client.insert` · edit: `…set_value` / `…save`
| Section | Field | Kind | API URL it needs |
|---|---|---|---|
| Header | `job_card` *(req)* | link | picker `POST /api/method/ex_auto.api.job_cards.list_jobs` |
| Header | `branch` | link | picker `POST /api/method/ex_auto.api.branches.list_branches` |
| Header | `warehouse` | link | picker `POST /api/method/frappe.client.get_list` `{doctype:"Warehouse"}` |
| Header | `is_urgent` | bool | rides in `…frappe.client.insert` |
| Header | `notes` | text | rides in `…frappe.client.insert` |
| Items `items[]` | `item_code` *(req)* | link | picker `POST /api/method/ex_auto.api.search.search_items` |
| Items `items[]` | `qty` *(req)* | number | rides in `…frappe.client.insert` |
| Items `items[]` | `uom` | data | rides in `…frappe.client.insert` |
| Items `items[]` | `warehouse` | link | picker `POST /api/method/frappe.client.get_list` `{doctype:"Warehouse"}` |
| Items `items[]` | `item_name`, `rate`, `amount`, `available_qty`, `is_issued` | placeholders | ride in `…frappe.client.insert` (recomputed later by store keeper) |

### §2.3 Detail screen (read) — `POST /api/method/ex_auto.api.parts.get_requisition`
Every header field, approval/issue stamps, `items[]`, and computed `readiness` block — delivered by `…parts.get_requisition`.

| Sub-flow | Full API URL |
|---|---|
| Live stock check (fills `available_qty`) | `POST /api/method/ex_auto.api.parts.get_item_availability` |

### §2.4 Detail actions (write)
| Action | Full API URL |
|---|---|
| Submit | `POST /api/method/ex_auto.api.parts.apply_requisition_action` `{action:"Submit"}` |
| Approve | `POST /api/method/ex_auto.api.parts.approve_requisition` |
| Issue all | `POST /api/method/ex_auto.api.parts.mark_issued` |
| Partial issue | `POST /api/method/ex_auto.api.parts.apply_requisition_action` `{action:"Partial Issue"}` |
| Cancel | `POST /api/method/ex_auto.api.parts.cancel_requisition` |
| Delete | `POST /api/method/frappe.client.delete` |

---

## Part 3 — Inspections · field map

### §3.1 List screen
| Element | Full API URL |
|---|---|
| Inspection list | `POST /api/method/ex_auto.api.inspections.list_inspections` |
| Status chip counts | `POST /api/method/ex_auto.api.inspections.status_counts` |
| Every list-row field (incl. `overall_result`, `items_pass/fail/attention`) | delivered by `…inspections.list_inspections` |

### §3.2 Create screen — write URL: `POST /api/method/frappe.client.insert` · edit: `…set_value`
| Field | Kind | API URL it needs |
|---|---|---|
| `inspection_type` *(req)* | select | rides in `…frappe.client.insert` |
| `inspection_date` *(req)* | date | rides in `…frappe.client.insert` |
| `branch` | link | picker `POST /api/method/ex_auto.api.branches.list_branches` |
| `job_card` | link | picker `POST /api/method/ex_auto.api.job_cards.list_jobs` |
| `inspector` | link → User | picker `POST /api/method/frappe.client.get_list` `{doctype:"User"}` |
| `checklist_template` | link | picker `POST /api/method/frappe.client.get_list` `{doctype:"Vehicle Checklist Template"}` |
| `vehicle` *(req)* | link | picker `POST /api/method/ex_auto.api.vehicles.list_vehicles` |
| `license_plate` | data | rides in `…frappe.client.insert` |
| `odometer_reading` | number | rides in `…frappe.client.insert` |
| `summary` | text | rides in `…frappe.client.insert` |

| Shortcut | Full API URL |
|---|---|
| Create from Job Card | `POST /api/method/ex_auto.api.inspections.create_for_job_card` |
| Find existing on Job Card | `POST /api/method/ex_auto.api.inspections.find_for_job_card` |

### §3.3 Detail screen (read) — `POST /api/method/ex_auto.api.inspections.get_detail`
Every header field, result rollup, `items[]`, `photos[]`, computed `progress`, and sign-off fields — delivered by `…inspections.get_detail`.

### §3.4 Detail actions (write)
| Action | Full API URL |
|---|---|
| Workflow transition | `POST /api/method/ex_auto.api.inspections.apply_action` |
| Update checklist item | `POST /api/method/ex_auto.api.inspections.update_item` |
| Load template | `POST /api/method/ex_auto.api.inspections.load_template` |
| Submit report | `POST /api/method/ex_auto.api.inspections.submit_report` |
| Create Job Card from inspection | `POST /api/method/ex_auto.api.inspections.create_job_card_from_inspection` |
| Item photo upload | `POST /api/method/upload_file` (multipart) → URL passed to `…update_item` |

---

## Part 4 — Dashboard · field map

### §4.1 Load
| Element | Full API URL |
|---|---|
| Full snapshot (all panels) | `POST /api/method/ex_auto.api.dashboard.snapshot` |

### §4.2 Primary KPIs — `POST /api/method/ex_auto.api.dashboard.kpis_primary`
| Field | Card | API URL it needs |
|---|---|---|
| `jobs_on_floor` | Jobs on Floor | `…dashboard.kpis_primary` |
| `today_appointments` | Today's Appointments | `…dashboard.kpis_primary` |
| `appointments_unconfirmed` | sub-stat | `…dashboard.kpis_primary` |
| `bay_utilization_pct` | Bay Utilisation | `…dashboard.kpis_primary` |
| `bay_load` / `bay_capacity` | sub-stat | `…dashboard.kpis_primary` |
| `revenue_mtd` | Revenue MTD | `…dashboard.kpis_primary` |

> Tile deep-links: **Jobs on Floor** → `…job_cards.list_jobs` (active statuses); **Today's Appointments** → `…appointments.list_appointments` (today).

### §4.3 Workshop Floor Live — `POST /api/method/ex_auto.api.dashboard.workshop_floor_live`
Every tile field (`name`, `status`, `priority`, `make_model`, `license_plate`, `primary_technician_name`, `expected_delivery_date`) — delivered by `…dashboard.workshop_floor_live`. Each tile deep-links to `…job_cards.get_detail`.

### §4.4 Today's Appointments
| Element | Full API URL |
|---|---|
| Quick top-few (pulse) | `POST /api/method/ex_auto.api.dashboard.today_pulse` |
| Full list (today) | `POST /api/method/ex_auto.api.appointments.list_appointments` |
| Today counts by status | `POST /api/method/ex_auto.api.appointments.today_summary` |
| Every appointment-row field | delivered by `…appointments.list_appointments` (or `…dashboard.today_pulse`) |

Per-row actions:
| Action | Full API URL |
|---|---|
| Confirm | `POST /api/method/ex_auto.api.appointments.confirm` |
| Start visit | `POST /api/method/ex_auto.api.appointments.start_visit` |
| Complete | `POST /api/method/ex_auto.api.appointments.complete` |
| Cancel | `POST /api/method/ex_auto.api.appointments.cancel` |
| Mark no-show | `POST /api/method/ex_auto.api.appointments.mark_no_show` |

### §4.5 Other dashboard panels (secondary)
| Panel | Full API URL |
|---|---|
| Secondary KPIs | `POST /api/method/ex_auto.api.dashboard.kpis_secondary` |
| Job status mix | `POST /api/method/ex_auto.api.dashboard.status_mix` |
| Branch load | `POST /api/method/ex_auto.api.dashboard.branch_load` |
| Top technicians | `POST /api/method/ex_auto.api.dashboard.top_technicians` |
| Attention feed | `POST /api/method/ex_auto.api.dashboard.attention_feed` |

---

## Shared picker URLs (used across every Create screen)

| Picker | Full API URL |
|---|---|
| Customer | `POST /api/method/ex_auto.api.search.search_customers` |
| Vehicle (scoped to customer) | `POST /api/method/ex_auto.api.search.list_customer_vehicles` |
| Vehicle (global) | `POST /api/method/ex_auto.api.vehicles.list_vehicles` |
| Item / Part | `POST /api/method/ex_auto.api.search.search_items` (`stock_item:1` = parts only) |
| Service Type | `POST /api/method/ex_auto.api.search.search_service_types` |
| Branch | `POST /api/method/ex_auto.api.branches.list_branches` |
| Technician | `POST /api/method/ex_auto.api.technicians.list_technicians` |
| Job Card | `POST /api/method/ex_auto.api.job_cards.list_jobs` |
| Estimate | `POST /api/method/ex_auto.api.estimates.list_estimates` |
| User (advisor / inspector) | `POST /api/method/frappe.client.get_list` `{doctype:"User"}` |
| Warehouse | `POST /api/method/frappe.client.get_list` `{doctype:"Warehouse"}` |
| Checklist Template | `POST /api/method/frappe.client.get_list` `{doctype:"Vehicle Checklist Template"}` |

## Shared generic CRUD URLs

| Operation | Full API URL |
|---|---|
| Create a doc | `POST /api/method/frappe.client.insert` |
| Patch fields | `POST /api/method/frappe.client.set_value` |
| Replace doc + child tables | `POST /api/method/frappe.client.save` |
| Delete a doc | `POST /api/method/frappe.client.delete` |
| Read one doc (no custom endpoint) | `POST /api/method/frappe.client.get` |
| Upload a file/photo | `POST /api/method/upload_file` (multipart) |

---















## Appendix — endpoint quick reference

### Job Cards (`ex_auto.api.job_cards`)
`list_jobs` · `status_counts` · `get_detail` · `apply_action` · `set_status` · `start_work` · `submit_for_qc` · `pass_qc` · `fail_qc` · `create_sales_invoice` · `mark_delivered` · `add_time_log` · `add_technician` · `add_labor_item` · `update_labor_status` · `add_checklist_item` · `add_checklist_from_template` · `update_checklist_item` · `request_parts`

### Parts Requisitions (`ex_auto.api.parts`)
`list_requisitions` · `requisition_status_counts` · `get_requisition` · `store_keeper_summary` · `get_item_availability` · `apply_requisition_action` · `approve_requisition` · `mark_issued` · `cancel_requisition`

### Inspections (`ex_auto.api.inspections`)
`list_inspections` · `status_counts` · `get_detail` · `apply_action` · `update_item` · `load_template` · `submit_report` · `create_for_job_card` · `find_for_job_card` · `create_job_card_from_inspection`

### Dashboard (`ex_auto.api.dashboard`)
`snapshot` · `kpis_primary` · `kpis_secondary` · `workshop_floor_live` · `today_pulse` · `status_mix` · `branch_load` · `top_technicians` · `attention_feed`

### Appointments (`ex_auto.api.appointments`)
`list_appointments` · `today_summary` · `status_counts` · `confirm` · `start_visit` · `complete` · `cancel` · `mark_no_show`

### Pickers / typeahead (`ex_auto.api.search` + `frappe.client.get_list`)
`search_customers` · `list_customer_vehicles` · `search_items` (`stock_item=1` for parts) · `search_service_types` · `branches.list_branches` · `technicians.list_technicians` · `job_cards.list_jobs` · `estimates.list_estimates` · `vehicles.list_vehicles` · `get_list` on `User` / `Warehouse` / `Vehicle Checklist Template`

### Generic CRUD (`frappe.client`)
`insert` · `set_value` · `save` · `delete` · `upload_file` (multipart, for Job Card photos)

See [api.md](api.md) for the full backend surface and [doctypes.md](doctypes.md) for field definitions.
