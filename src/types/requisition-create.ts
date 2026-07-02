export type Choice = { value: string; label: string };

export interface Line {
  item_code: string;
  item_name: string;
  qty: number;
  uom: string;
  rate: number;
  warehouse?: string;
}

export type PickerKind = null | "job" | "branch" | "warehouse" | "item";
