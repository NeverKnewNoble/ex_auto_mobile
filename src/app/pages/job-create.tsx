import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Button,
  Card,
  ChipSelect,
  Picker,
  Screen,
  SectionLabel,
  SelectField,
  TextField,
} from "@/components";
import { useToast } from "@/components/toast";
import { useAction } from "@/hooks/use-action";
import {
  createJobCard,
  listAdvisors,
  listBranches,
  listCustomerVehicles,
  listEstimates,
  listTechnicians,
  searchCustomers,
} from "@/services";
import type { CustomerMeta, EstimateMeta, VehicleMeta } from "@/types/picker";
import type { FuelLevel, JobCardCreate } from "@/types/job-card";
import type { FormState, OpenPicker } from "@/types/job-create";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
const FUEL_LEVELS: FuelLevel[] = ["", "Empty", "1/4", "1/2", "3/4", "Full"];

const INITIAL: FormState = {
  posting_date: "2026-06-29",
  expected_delivery_date: "",
  branch: "Accra Main",
  priority: "Medium",
  service_advisor: "",
  serviceAdvisorLabel: "",
  primary_technician: "",
  primaryTechnicianLabel: "",
  service_estimate: "",
  serviceEstimateLabel: "",
  customer: "",
  customerLabel: "",
  customer_mobile: "",
  customer_email: "",
  vehicle: "",
  vehicleLabel: "",
  license_plate: "",
  make_model: "",
  odometer_reading: "",
  fuel_level: "",
  customer_complaints: "",
  diagnosis_summary: "",
  service_advisor_notes: "",
};

export default function JobCreateScreen() {
  const router = useRouter();
  const toast = useToast();
  const { run, busy } = useAction();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const close = () => setOpenPicker(null);

  const canSubmit = !!(form.branch && form.customer && form.vehicle && form.customer_complaints.trim());

  const submit = () => {
    const payload: JobCardCreate = {
      posting_date: form.posting_date,
      branch: form.branch,
      priority: form.priority,
      customer: form.customer,
      vehicle: form.vehicle,
      customer_complaints: form.customer_complaints.trim(),
      expected_delivery_date: form.expected_delivery_date.trim() || undefined,
      service_advisor: form.service_advisor || undefined,
      primary_technician: form.primary_technician || undefined,
      service_estimate: form.service_estimate || undefined,
      customer_mobile: form.customer_mobile.trim() || undefined,
      customer_email: form.customer_email.trim() || undefined,
      license_plate: form.license_plate.trim() || undefined,
      make_model: form.make_model.trim() || undefined,
      odometer_reading: form.odometer_reading ? Number(form.odometer_reading) : undefined,
      fuel_level: form.fuel_level || undefined,
      diagnosis_summary: form.diagnosis_summary.trim() || undefined,
      service_advisor_notes: form.service_advisor_notes.trim() || undefined,
    };
    run(() => createJobCard(payload), {
      success: "Job card created",
      onDone: (j) => router.replace({ pathname: "/pages/job-detail", params: { id: j.name } }),
    });
  };

  return (
    <Screen>
      <AppHeader back title="New job card" />

      <Card>
        <SectionLabel>Job details</SectionLabel>
        <View className="gap-3">
          <TextField label="Posting date" value={form.posting_date} onChangeText={(t) => set({ posting_date: t })} mono />
          <TextField
            label="Expected delivery"
            value={form.expected_delivery_date}
            onChangeText={(t) => set({ expected_delivery_date: t })}
            placeholder="YYYY-MM-DD"
            mono
          />
          <SelectField label="Branch" required value={form.branch} icon="business-outline" onPress={() => setOpenPicker("branch")} />
          <ChipSelect label="Priority" options={PRIORITIES} value={form.priority} onChange={(v) => set({ priority: v })} />
          <SelectField
            label="Service advisor"
            value={form.serviceAdvisorLabel}
            icon="person-circle-outline"
            onPress={() => setOpenPicker("advisor")}
          />
          <SelectField
            label="Primary technician"
            value={form.primaryTechnicianLabel}
            icon="build-outline"
            onPress={() => setOpenPicker("technician")}
          />
          <SelectField
            label="Service estimate"
            value={form.serviceEstimateLabel}
            icon="document-text-outline"
            onPress={() => setOpenPicker("estimate")}
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>Customer</SectionLabel>
        <View className="gap-3">
          <SelectField
            label="Customer"
            required
            value={form.customerLabel}
            icon="person-outline"
            onPress={() => setOpenPicker("customer")}
          />
          <TextField
            label="Mobile"
            value={form.customer_mobile}
            onChangeText={(t) => set({ customer_mobile: t })}
            keyboardType="phone-pad"
            mono
          />
          <TextField
            label="Email"
            value={form.customer_email}
            onChangeText={(t) => set({ customer_email: t })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>Vehicle</SectionLabel>
        <View className="gap-3">
          <SelectField
            label="Vehicle"
            required
            value={form.vehicleLabel}
            icon="car-outline"
            placeholder={form.customer ? "Select…" : "Select a customer first"}
            onPress={() => {
              if (!form.customer) {
                toast.show("Select a customer first");
                return;
              }
              setOpenPicker("vehicle");
            }}
          />
          <TextField label="License plate" value={form.license_plate} onChangeText={(t) => set({ license_plate: t })} mono autoCapitalize="characters" />
          <TextField label="Make / model" value={form.make_model} onChangeText={(t) => set({ make_model: t })} />
          <TextField
            label="Odometer (km)"
            value={form.odometer_reading}
            onChangeText={(t) => set({ odometer_reading: t })}
            keyboardType="number-pad"
            mono
          />
          <ChipSelect label="Fuel level" options={FUEL_LEVELS} value={form.fuel_level} onChange={(v) => set({ fuel_level: v })} />
        </View>
      </Card>

      <Card>
        <SectionLabel>Complaint & diagnosis</SectionLabel>
        <View className="gap-3">
          <TextField
            label="Customer complaints"
            required
            value={form.customer_complaints}
            onChangeText={(t) => set({ customer_complaints: t })}
            placeholder="What did the customer report?"
            multiline
          />
          <TextField
            label="Diagnosis summary"
            value={form.diagnosis_summary}
            onChangeText={(t) => set({ diagnosis_summary: t })}
            multiline
          />
          <TextField
            label="Advisor notes (internal)"
            value={form.service_advisor_notes}
            onChangeText={(t) => set({ service_advisor_notes: t })}
            multiline
          />
        </View>
      </Card>

      <Button label="Create job card" icon="checkmark" block disabled={!canSubmit} loading={busy} onPress={submit} />

      {/* Pickers — one open at a time, switched by openPicker */}
      <Picker
        visible={openPicker === "branch"}
        onClose={close}
        title="Branch"
        load={(q) => listBranches(q)}
        onSelect={(o) => set({ branch: o.value })}
      />
      <Picker
        visible={openPicker === "advisor"}
        onClose={close}
        title="Service advisor"
        load={(q) => listAdvisors(q)}
        onSelect={(o) => set({ service_advisor: o.value, serviceAdvisorLabel: o.label })}
      />
      <Picker
        visible={openPicker === "technician"}
        onClose={close}
        title="Primary technician"
        load={(q) => listTechnicians(q)}
        onSelect={(o) => set({ primary_technician: o.value, primaryTechnicianLabel: o.label })}
      />
      <Picker<EstimateMeta>
        visible={openPicker === "estimate"}
        onClose={close}
        title="Service estimate"
        load={(q) => listEstimates(q)}
        onSelect={(o) =>
          set({
            service_estimate: o.value,
            serviceEstimateLabel: o.label,
            customer: o.meta?.customer ?? "",
            customerLabel: o.meta?.customer_name ?? "",
            vehicle: o.meta?.vehicle ?? "",
            vehicleLabel: o.meta?.make_model ?? o.meta?.vehicle ?? "",
            branch: o.meta?.branch ?? form.branch,
            license_plate: o.meta?.license_plate ?? "",
            make_model: o.meta?.make_model ?? "",
          })
        }
      />
      <Picker<CustomerMeta>
        visible={openPicker === "customer"}
        onClose={close}
        title="Customer"
        load={(q) => searchCustomers(q)}
        onSelect={(o) =>
          set({
            customer: o.value,
            customerLabel: o.label,
            customer_mobile: o.meta?.mobile_no ?? "",
            customer_email: o.meta?.email_id ?? "",
            // reset vehicle when the customer changes
            vehicle: "",
            vehicleLabel: "",
            license_plate: "",
            make_model: "",
            odometer_reading: "",
          })
        }
      />
      <Picker<VehicleMeta>
        visible={openPicker === "vehicle"}
        onClose={close}
        title="Vehicle"
        searchable={false}
        load={() => listCustomerVehicles(form.customer)}
        onSelect={(o) =>
          set({
            vehicle: o.value,
            vehicleLabel: o.label,
            license_plate: o.meta?.license_plate ?? "",
            make_model: o.meta?.make_model ?? "",
            odometer_reading: o.meta?.odometer_reading != null ? String(o.meta.odometer_reading) : "",
          })
        }
      />
    </Screen>
  );
}
