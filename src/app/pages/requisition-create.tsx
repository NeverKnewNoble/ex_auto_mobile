import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  Icon,
  Picker,
  QtyStepper,
  Readout,
  Screen,
  SectionLabel,
  SelectField,
  SwitchRow,
  TextField,
} from "@/components";
import { useToast } from "@/components/toast";
import { useAction } from "@/hooks/use-action";
import { createRequisition, listBranches, listWarehouses, searchItems, searchJobs } from "@/services";
import { money } from "@/lib/format";
import type { PickerOption } from "@/types/picker";
import type { Choice, Line, PickerKind } from "@/types/requisition-create";

const EMPTY: Choice = { value: "", label: "" };

const PICKER_TITLE: Record<Exclude<PickerKind, null>, string> = {
  job: "Job card",
  branch: "Branch",
  warehouse: "Warehouse",
  item: "Add part",
};

export default function RequisitionCreate() {
  const router = useRouter();
  const toast = useToast();
  const { run, busy } = useAction();

  const [jobCard, setJobCard] = useState<Choice>(EMPTY);
  const [branch, setBranch] = useState<Choice>(EMPTY);
  const [warehouse, setWarehouse] = useState<Choice>(EMPTY);
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [openPicker, setOpenPicker] = useState<PickerKind>(null);

  const total = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const canSubmit = !!jobCard.value && lines.length > 0;

  const setQty = (code: string, qty: number) => setLines((p) => p.map((l) => (l.item_code === code ? { ...l, qty } : l)));
  const remove = (code: string) => setLines((p) => p.filter((l) => l.item_code !== code));

  const addItem = (o: PickerOption<any>) => {
    if (lines.some((l) => l.item_code === o.value)) {
      toast.show("Already added");
      return;
    }
    setLines((p) => [
      ...p,
      {
        item_code: o.value,
        item_name: o.label,
        qty: 1,
        uom: o.meta?.stock_uom ?? "Nos",
        rate: o.meta?.standard_rate ?? 0,
        warehouse: warehouse.value || undefined,
      },
    ]);
  };

  const loadOptions = (q: string): Promise<PickerOption<any>[]> => {
    switch (openPicker) {
      case "job":
        return searchJobs(q);
      case "branch":
        return listBranches(q);
      case "warehouse":
        return listWarehouses(q);
      case "item":
        return searchItems(q, true);
      default:
        return Promise.resolve([]);
    }
  };

  const onPick = (o: PickerOption<any>) => {
    switch (openPicker) {
      case "job":
        setJobCard({ value: o.value, label: o.label });
        setBranch({ value: o.meta?.branch ?? "", label: o.meta?.branch ?? "" });
        break;
      case "branch":
        setBranch({ value: o.value, label: o.label });
        break;
      case "warehouse":
        setWarehouse({ value: o.value, label: o.label });
        setLines((p) => p.map((l) => ({ ...l, warehouse: o.value })));
        break;
      case "item":
        addItem(o);
        break;
    }
  };

  const submit = () =>
    run(
      () =>
        createRequisition({
          job_card: jobCard.value,
          branch: branch.value || undefined,
          warehouse: warehouse.value || undefined,
          is_urgent: isUrgent,
          notes: notes.trim() || undefined,
          items: lines.map((l) => ({
            item_code: l.item_code,
            item_name: l.item_name,
            qty: l.qty,
            uom: l.uom,
            rate: l.rate,
            amount: Math.round(l.qty * l.rate * 100) / 100,
            available_qty: 0,
            is_issued: false,
            warehouse: l.warehouse,
          })),
        }),
      {
        success: "Requisition created",
        onDone: (r) => router.replace({ pathname: "/pages/requisition-detail", params: { name: r.name } }),
      }
    );

  return (
    <Screen>
      <AppHeader back title="New requisition" />

      <Card>
        <SectionLabel>Requisition</SectionLabel>
        <View className="mt-1 gap-3">
          <SelectField
            label="Job card"
            required
            icon="construct-outline"
            value={jobCard.label || undefined}
            onPress={() => setOpenPicker("job")}
          />
          <SelectField
            label="Branch"
            icon="business-outline"
            value={branch.label || undefined}
            onPress={() => setOpenPicker("branch")}
          />
          <SelectField
            label="Warehouse"
            icon="cube-outline"
            value={warehouse.label || undefined}
            onPress={() => setOpenPicker("warehouse")}
          />
          <SwitchRow label="Urgent" hint="Flag for immediate pick" value={isUrgent} onValueChange={setIsUrgent} />
          <TextField label="Notes" value={notes} onChangeText={setNotes} placeholder="Front axle only…" multiline />
        </View>
      </Card>

      <Card>
        <SectionLabel right={<Readout size={13} weight="semibold">{money(total)}</Readout>}>Items</SectionLabel>
        <View className="mt-1 gap-3">
          {lines.map((l) => (
            <View key={l.item_code} className="flex-row items-center gap-3 rounded-md border border-border bg-card p-3">
              <View className="flex-1">
                <Bold className="text-[14px]">{l.item_name}</Bold>
                <Caption>
                  {l.item_code} · {l.uom} · {money(l.rate)}
                </Caption>
              </View>
              <QtyStepper value={l.qty} onChange={(n) => setQty(l.item_code, n)} />
              <Pressable onPress={() => remove(l.item_code)} hitSlop={8}>
                <Icon name="trash-outline" size={18} color="#E11D2A" />
              </Pressable>
            </View>
          ))}
          <Button label="Add part" variant="secondary" icon="search" block onPress={() => setOpenPicker("item")} />
        </View>
      </Card>

      <Button label="Create requisition" icon="paper-plane" block disabled={!canSubmit} loading={busy} onPress={submit} />

      <Picker<any>
        visible={openPicker !== null}
        onClose={() => setOpenPicker(null)}
        title={openPicker ? PICKER_TITLE[openPicker] : ""}
        load={loadOptions}
        onSelect={onPick}
      />
    </Screen>
  );
}
