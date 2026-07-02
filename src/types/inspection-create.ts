import type { InspectionType } from "@/types/inspection";

export type OpenPicker = null | "branch" | "job" | "inspector" | "template" | "vehicle";

export interface FormState {
  inspection_type: InspectionType;
  inspection_date: string;
  branch: string;
  job_card: string;
  jobCardLabel: string;
  inspector: string;
  inspectorLabel: string;
  checklist_template: string;
  checklistTemplateLabel: string;
  vehicle: string;
  vehicleLabel: string;
  license_plate: string;
  odometer_reading: string;
  summary: string;
}
