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
import { useAction } from "@/hooks/use-action";
import { createInspection, listAdvisors, listBranches, listChecklistTemplates, searchJobs, searchVehicles } from "@/services";
import { INSPECTION_TYPES, type InspectionCreate } from "@/types/inspection";
import type { VehicleMeta } from "@/types/picker";
import type { FormState, OpenPicker } from "@/types/inspection-create";

const INITIAL: FormState = {
  inspection_type: "Pre-service",
  inspection_date: "2026-06-29",
  branch: "Accra Main",
  job_card: "",
  jobCardLabel: "",
  inspector: "",
  inspectorLabel: "",
  checklist_template: "",
  checklistTemplateLabel: "",
  vehicle: "",
  vehicleLabel: "",
  license_plate: "",
  odometer_reading: "",
  summary: "",
};

export default function InspectionCreateScreen() {
  const router = useRouter();
  const { run, busy } = useAction();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const close = () => setOpenPicker(null);

  const canSubmit = !!(form.vehicle && form.inspection_date);

  const submit = () => {
    const payload: InspectionCreate = {
      inspection_type: form.inspection_type,
      inspection_date: form.inspection_date,
      branch: form.branch || undefined,
      job_card: form.job_card || undefined,
      inspector: form.inspector || undefined,
      checklist_template: form.checklist_template || undefined,
      vehicle: form.vehicle,
      license_plate: form.license_plate.trim() || undefined,
      odometer_reading: form.odometer_reading ? Number(form.odometer_reading) : undefined,
      summary: form.summary.trim() || undefined,
    };
    run(() => createInspection(payload), {
      success: "Inspection created",
      onDone: (ins) => router.replace({ pathname: "/pages/inspection-detail", params: { name: ins.name } }),
    });
  };

  return (
    <Screen>
      <AppHeader back title="New inspection" />

      <Card>
        <SectionLabel>Inspection</SectionLabel>
        <View className="gap-3">
          <ChipSelect
            label="Type"
            options={INSPECTION_TYPES}
            value={form.inspection_type}
            onChange={(v) => set({ inspection_type: v })}
          />
          <TextField
            label="Inspection date"
            required
            value={form.inspection_date}
            onChangeText={(t) => set({ inspection_date: t })}
            placeholder="YYYY-MM-DD"
            mono
          />
          <SelectField label="Branch" required value={form.branch} icon="business-outline" onPress={() => setOpenPicker("branch")} />
          <SelectField label="Job card" value={form.jobCardLabel} icon="document-text-outline" onPress={() => setOpenPicker("job")} />
          <SelectField label="Inspector" value={form.inspectorLabel} icon="person-circle-outline" onPress={() => setOpenPicker("inspector")} />
          <SelectField
            label="Checklist template"
            value={form.checklistTemplateLabel}
            icon="list-outline"
            onPress={() => setOpenPicker("template")}
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>Vehicle</SectionLabel>
        <View className="gap-3">
          <SelectField label="Vehicle" required value={form.vehicleLabel} icon="car-outline" onPress={() => setOpenPicker("vehicle")} />
          <TextField
            label="License plate"
            value={form.license_plate}
            onChangeText={(t) => set({ license_plate: t })}
            mono
            autoCapitalize="characters"
          />
          <TextField
            label="Odometer (km)"
            value={form.odometer_reading}
            onChangeText={(t) => set({ odometer_reading: t })}
            keyboardType="number-pad"
            mono
          />
          <TextField label="Summary" value={form.summary} onChangeText={(t) => set({ summary: t })} multiline />
        </View>
      </Card>

      <Button label="Create inspection" icon="checkmark" block disabled={!canSubmit} loading={busy} onPress={submit} />

      {/* Pickers — one open at a time, switched by openPicker */}
      <Picker
        visible={openPicker === "branch"}
        onClose={close}
        title="Branch"
        load={(q) => listBranches(q)}
        onSelect={(o) => set({ branch: o.value })}
      />
      <Picker
        visible={openPicker === "job"}
        onClose={close}
        title="Job card"
        load={(q) => searchJobs(q)}
        onSelect={(o) =>
          set({
            job_card: o.value,
            jobCardLabel: o.label,
            vehicle: o.meta?.vehicle ?? form.vehicle,
            vehicleLabel: o.meta?.make_model ?? form.vehicleLabel,
            license_plate: o.meta?.license_plate ?? form.license_plate,
            branch: o.meta?.branch ?? form.branch,
          })
        }
      />
      <Picker
        visible={openPicker === "inspector"}
        onClose={close}
        title="Inspector"
        load={(q) => listAdvisors(q)}
        onSelect={(o) => set({ inspector: o.value, inspectorLabel: o.label })}
      />
      <Picker
        visible={openPicker === "template"}
        onClose={close}
        title="Checklist template"
        load={(q) => listChecklistTemplates(q)}
        onSelect={(o) => set({ checklist_template: o.value, checklistTemplateLabel: o.label })}
      />
      <Picker<VehicleMeta>
        visible={openPicker === "vehicle"}
        onClose={close}
        title="Vehicle"
        load={(q) => searchVehicles(q)}
        onSelect={(o) =>
          set({
            vehicle: o.value,
            vehicleLabel: o.label,
            license_plate: o.meta?.license_plate ?? "",
            odometer_reading: o.meta?.odometer_reading != null ? String(o.meta.odometer_reading) : "",
          })
        }
      />
    </Screen>
  );
}
