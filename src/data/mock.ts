/**
 * Mock shop-floor data for the design pass — stands in for the Frappe API until
 * the services layer is wired. Shapes match src/types. "Today" is 2026-06-28.
 */
import type {
  Appointment,
  Inspection,
  JobCard,
  Requisition,
  Vehicle,
} from "@/types";

export const CURRENT_TECH = "M. Osei";
export const BRANCH = "Accra — North Workshop";

export const appointments: Appointment[] = [
  {
    name: "APT-2042",
    time: "2026-06-28T08:00:00",
    status: "Checked In",
    customerName: "Kofi Mensah",
    vehiclePlate: "GR 4471-21",
    vehicleLabel: "2021 Toyota Hilux",
    complaint: "Brake judder under heavy braking, pulls left.",
    serviceType: "Brake service",
    bay: "Bay 3",
  },
  {
    name: "APT-2043",
    time: "2026-06-28T09:30:00",
    status: "Confirmed",
    customerName: "Ama Boateng",
    vehiclePlate: "GW 1180-22",
    vehicleLabel: "2022 Honda CR-V",
    complaint: "60,000 km major service. Customer waiting.",
    serviceType: "Scheduled service",
  },
  {
    name: "APT-2044",
    time: "2026-06-28T11:00:00",
    status: "Scheduled",
    customerName: "Yaw Darko",
    vehiclePlate: "AS 9920-19",
    vehicleLabel: "2019 Ford Ranger",
    complaint: "AC not cooling, intermittent fan noise.",
    serviceType: "Diagnostics",
  },
  {
    name: "APT-2045",
    time: "2026-06-28T13:30:00",
    status: "Scheduled",
    customerName: "Efua Sarpong",
    vehiclePlate: "GT 2287-23",
    vehicleLabel: "2023 Hyundai Tucson",
    complaint: "Pre-delivery inspection for new fleet unit.",
    serviceType: "Pre-delivery QC",
  },
  {
    name: "APT-2046",
    time: "2026-06-28T15:00:00",
    status: "No Show",
    customerName: "Kwesi Owusu",
    vehiclePlate: "GE 5512-20",
    vehicleLabel: "2020 Nissan Navara",
    complaint: "Oil change + tyre rotation.",
    serviceType: "Scheduled service",
  },
];

export const jobCards: JobCard[] = [
  {
    name: "JOB-1042",
    status: "In Progress",
    vehiclePlate: "GR 4471-21",
    vehicleLabel: "2021 Toyota Hilux",
    customerName: "Kofi Mensah",
    complaint: "Brake judder under heavy braking, pulls left.",
    bay: "Bay 3",
    assignedTo: CURRENT_TECH,
    checklist: [
      { name: "T1", label: "Road test to confirm complaint", done: true },
      { name: "T2", label: "Remove front wheels, inspect pads", done: true },
      { name: "T3", label: "Measure disc runout & thickness", done: true },
      { name: "T4", label: "Replace front pads & machine discs", done: false },
      { name: "T5", label: "Bleed brake circuit", done: false },
      { name: "T6", label: "Final road test", done: false },
    ],
    parts: [
      { name: "P1", partNo: "BP-HLX-F", description: "Front brake pad set", qty: 1, status: "Fitted" },
      { name: "P2", partNo: "BRK-FLUID-DOT4", description: "DOT 4 brake fluid 1L", qty: 1, status: "Available" },
      { name: "P3", partNo: "DISC-HLX-F", description: "Front brake disc (pair)", qty: 2, status: "Awaiting Parts" },
    ],
    timeLogs: [
      { name: "TL1", task: "Diagnosis & road test", startedAt: "2026-06-28T08:15:00", endedAt: "2026-06-28T08:55:00" },
      { name: "TL2", task: "Brake strip & inspect", startedAt: "2026-06-28T09:10:00" }, // running
    ],
    photoCount: 4,
    signedOff: false,
  },
  {
    name: "JOB-1043",
    status: "Quality Check",
    vehiclePlate: "GW 1180-22",
    vehicleLabel: "2022 Honda CR-V",
    customerName: "Ama Boateng",
    complaint: "60,000 km major service.",
    bay: "Bay 1",
    assignedTo: CURRENT_TECH,
    checklist: [
      { name: "T1", label: "Engine oil & filter", done: true },
      { name: "T2", label: "Air & cabin filters", done: true },
      { name: "T3", label: "Spark plugs", done: true },
      { name: "T4", label: "Brake fluid & coolant check", done: true },
      { name: "T5", label: "QC sign-off", done: false },
    ],
    parts: [
      { name: "P1", partNo: "OIL-5W30-5L", description: "5W-30 synthetic 5L", qty: 1, status: "Fitted" },
      { name: "P2", partNo: "FLT-OIL-CRV", description: "Oil filter", qty: 1, status: "Fitted" },
    ],
    timeLogs: [
      { name: "TL1", task: "Major service", startedAt: "2026-06-27T14:00:00", endedAt: "2026-06-27T16:20:00" },
    ],
    photoCount: 2,
    signedOff: false,
  },
  {
    name: "JOB-1039",
    status: "Delivered",
    vehiclePlate: "GE 5512-20",
    vehicleLabel: "2020 Nissan Navara",
    customerName: "Kwesi Owusu",
    complaint: "Oil change + tyre rotation.",
    bay: "Bay 2",
    assignedTo: CURRENT_TECH,
    checklist: [
      { name: "T1", label: "Engine oil & filter", done: true },
      { name: "T2", label: "Rotate tyres", done: true },
      { name: "T3", label: "Delivery sign-off", done: true },
    ],
    parts: [],
    timeLogs: [
      { name: "TL1", task: "Service", startedAt: "2026-06-26T10:00:00", endedAt: "2026-06-26T10:40:00" },
    ],
    photoCount: 1,
    signedOff: true,
  },
];

const walkAround = (results: ("OK" | "Attention" | "Failed" | null)[]) => [
  { section: "Exterior", label: "Front bumper & lights" },
  { section: "Exterior", label: "Bodywork — left side" },
  { section: "Exterior", label: "Bodywork — right side" },
  { section: "Exterior", label: "Rear & tailgate" },
  { section: "Tyres", label: "Front tyres — tread & pressure" },
  { section: "Tyres", label: "Rear tyres — tread & pressure" },
  { section: "Under hood", label: "Engine oil level & condition" },
  { section: "Under hood", label: "Coolant & brake fluid" },
  { section: "Under hood", label: "Belts & hoses" },
  { section: "Cabin", label: "Warning lights on dash" },
].map((it, i) => ({
  name: `IT${i + 1}`,
  label: it.label,
  section: it.section,
  result: results[i] ?? null,
  photoCount: results[i] === "Failed" || results[i] === "Attention" ? 1 : 0,
}));

export const inspections: Inspection[] = [
  {
    name: "INS-3071",
    template: "Walk-around",
    status: "In Progress",
    vehiclePlate: "AS 9920-19",
    vehicleLabel: "2019 Ford Ranger",
    inspector: CURRENT_TECH,
    startedAt: "2026-06-28T11:10:00",
    items: walkAround(["OK", "OK", "Attention", "OK", "Failed", "OK", "OK", null, null, null]),
    signed: false,
  },
  {
    name: "INS-3068",
    template: "Pre-delivery QC",
    status: "Completed",
    vehiclePlate: "GT 2287-23",
    vehicleLabel: "2023 Hyundai Tucson",
    inspector: CURRENT_TECH,
    startedAt: "2026-06-27T16:40:00",
    items: walkAround(["OK", "OK", "OK", "OK", "OK", "OK", "OK", "OK", "OK", "OK"]),
    signed: true,
  },
];

export const inspectionTemplates = [
  { name: "Walk-around", detail: "10-point arrival check", items: 10 },
  { name: "Pre-delivery QC", detail: "Final check before handover", items: 18 },
  { name: "Damage report", detail: "Photo-led incident record", items: 6 },
  { name: "Brake & tyre", detail: "Safety-critical wear check", items: 8 },
];

export const requisitions: Requisition[] = [
  {
    name: "REQ-880",
    partNo: "DISC-HLX-F",
    description: "Front brake disc (pair)",
    qty: 2,
    forJob: "JOB-1042",
    status: "Awaiting Parts",
    requestedAt: "2026-06-28T09:20:00",
  },
  {
    name: "REQ-879",
    partNo: "WIPER-CRV-22",
    description: "Wiper blade set",
    qty: 1,
    forJob: "JOB-1043",
    status: "Available",
    requestedAt: "2026-06-28T08:05:00",
  },
  {
    name: "REQ-877",
    partNo: "AC-COMP-RNG",
    description: "AC compressor — reman",
    qty: 1,
    forJob: "JOB-1044",
    status: "Under Review",
    requestedAt: "2026-06-28T11:35:00",
  },
];

export const vehicles: Vehicle[] = [
  {
    name: "VEH-001", plate: "GR 4471-21", make: "Toyota", model: "Hilux", year: 2021,
    vin: "MR0FR22G1M0123456", color: "Silver", odometer: 84210, customer: "Kofi Mensah",
    warrantyStatus: "Expiring Soon", warrantyUntil: "2026-09-30",
  },
  {
    name: "VEH-002", plate: "GW 1180-22", make: "Honda", model: "CR-V", year: 2022,
    vin: "2HKRW2H81NH334512", color: "Pearl White", odometer: 60140, customer: "Ama Boateng",
    warrantyStatus: "Active", warrantyUntil: "2027-03-15",
  },
  {
    name: "VEH-003", plate: "AS 9920-19", make: "Ford", model: "Ranger", year: 2019,
    vin: "MNBXXXWPGKW778901", color: "Blue", odometer: 121530, customer: "Yaw Darko",
    warrantyStatus: "Expired",
  },
];

/** Recent service history for the lookup screen (most recent first). */
export const serviceHistory: Record<string, { date: string; label: string; status: string }[]> = {
  "GR 4471-21": [
    { date: "2026-06-28", label: "Brake service", status: "In Progress" },
    { date: "2026-01-12", label: "40k service", status: "Delivered" },
    { date: "2025-07-03", label: "Tyre replacement ×4", status: "Delivered" },
  ],
  "GW 1180-22": [
    { date: "2026-06-28", label: "60k major service", status: "Quality Check" },
    { date: "2025-09-19", label: "AC regas", status: "Delivered" },
  ],
  "AS 9920-19": [
    { date: "2026-06-28", label: "AC diagnostics", status: "Scheduled" },
    { date: "2025-11-02", label: "Clutch replacement", status: "Delivered" },
  ],
};
