/** Generic typeahead option returned by the picker endpoints (value · label · meta). */
export interface PickerOption<M = Record<string, unknown>> {
  value: string;
  label: string;
  sublabel?: string;
  meta?: M;
}

export interface CustomerMeta {
  mobile_no?: string;
  email_id?: string;
}
export interface VehicleMeta {
  license_plate: string;
  make_model: string;
  odometer_reading: number;
}
export interface EstimateMeta {
  customer: string;
  customer_name: string;
  vehicle: string;
  branch: string;
  license_plate: string;
  make_model: string;
}
export interface ItemMeta {
  item_code: string;
  stock_uom: string;
  standard_rate: number;
  is_stock_item: boolean;
}

/** Meta carried by the Job Card picker option (cascade source). */
export interface JobPickerMeta {
  branch: string;
  vehicle?: string;
  license_plate?: string;
  make_model?: string;
}
