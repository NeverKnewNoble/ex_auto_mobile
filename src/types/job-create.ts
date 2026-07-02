import type { FuelLevel, Priority } from "@/types/job-card";

export type OpenPicker = null | "branch" | "advisor" | "technician" | "estimate" | "customer" | "vehicle";

export interface FormState {
  posting_date: string;
  expected_delivery_date: string;
  branch: string;
  priority: Priority;
  service_advisor: string;
  serviceAdvisorLabel: string;
  primary_technician: string;
  primaryTechnicianLabel: string;
  service_estimate: string;
  serviceEstimateLabel: string;
  customer: string;
  customerLabel: string;
  customer_mobile: string;
  customer_email: string;
  vehicle: string;
  vehicleLabel: string;
  license_plate: string;
  make_model: string;
  odometer_reading: string;
  fuel_level: FuelLevel;
  customer_complaints: string;
  diagnosis_summary: string;
  service_advisor_notes: string;
}
