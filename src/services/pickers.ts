import { call } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { JobCardListRow } from "@/types/job-card";
import type { CustomerMeta, EstimateMeta, ItemMeta, JobPickerMeta, PickerOption, VehicleMeta } from "@/types/picker";

const E = ENDPOINTS.pickers;

/** Typeahead sources (Part 5 — shared picker URLs). ex_auto.api.search + list endpoints. */
export class PickerService {
  static customers(q: string) {
    return call<PickerOption<CustomerMeta>[]>(E.searchCustomers, { q, limit: 10 });
  }
  static customerVehicles(customer: string) {
    return call<PickerOption<VehicleMeta>[]>(E.listCustomerVehicles, { customer });
  }
  static items(q: string, stockOnly = true) {
    return call<PickerOption<ItemMeta>[]>(E.searchItems, { q, limit: 12, stock_item: stockOnly });
  }
  static branches(search = "") {
    return call<PickerOption[]>(E.listBranches, { search, limit: 20 });
  }
  static technicians(search = "") {
    return call<PickerOption[]>(E.listTechnicians, { search, limit: 15 });
  }
  static estimates(search = "") {
    return call<PickerOption<EstimateMeta>[]>(E.listEstimates, { search, limit: 12 });
  }
  static advisors(q = "") {
    return call<PickerOption[]>(ENDPOINTS.crud.getList, {
      doctype: "User",
      fields: ["name", "full_name", "email"],
      filters: { enabled: 1, user_type: "System User" },
      or_filters: q ? [["full_name", "like", `%${q}%`]] : undefined,
      limit_page_length: 20,
    });
  }
  static warehouses(q = "") {
    return call<PickerOption[]>(ENDPOINTS.crud.getList, {
      doctype: "Warehouse",
      fields: ["name", "warehouse_name", "company"],
      filters: { is_group: 0, disabled: 0 },
      or_filters: q ? [["name", "like", `%${q}%`], ["warehouse_name", "like", `%${q}%`]] : undefined,
      order_by: "warehouse_name asc",
      limit_page_length: 20,
    });
  }
  static async jobs(search = ""): Promise<PickerOption<JobPickerMeta>[]> {
    const rows = await call<JobCardListRow[]>(E.listJobs, { search, limit: 12 });
    return rows.map((r) => ({
      value: r.name,
      label: r.name,
      sublabel: `${r.make_model} · ${r.customer_name}`,
      meta: { branch: r.branch, vehicle: r.license_plate, license_plate: r.license_plate, make_model: r.make_model },
    }));
  }
  static vehicles(search = "") {
    return call<PickerOption<VehicleMeta>[]>(E.listVehicles, { search, limit: 15 });
  }
  static checklistTemplates(q = "") {
    return call<PickerOption[]>(ENDPOINTS.crud.getList, {
      doctype: "Vehicle Checklist Template",
      fields: ["name", "template_name", "applies_to"],
      filters: { is_active: 1 },
      or_filters: q ? [["template_name", "like", `%${q}%`]] : undefined,
      order_by: "template_name asc",
      limit_page_length: 20,
    });
  }
}

// ── public API ──
export const searchCustomers = (q: string) => PickerService.customers(q);
export const listCustomerVehicles = (customer: string) => PickerService.customerVehicles(customer);
export const searchItems = (q: string, stockOnly = true) => PickerService.items(q, stockOnly);
export const listBranches = (search = "") => PickerService.branches(search);
export const listTechnicians = (search = "") => PickerService.technicians(search);
export const listEstimates = (search = "") => PickerService.estimates(search);
export const listAdvisors = (q = "") => PickerService.advisors(q);
export const listWarehouses = (q = "") => PickerService.warehouses(q);
export const searchJobs = (search = "") => PickerService.jobs(search);
export const searchVehicles = (search = "") => PickerService.vehicles(search);
export const listChecklistTemplates = (q = "") => PickerService.checklistTemplates(q);
