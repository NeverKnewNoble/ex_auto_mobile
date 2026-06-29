import { useMemo, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  Fab,
  PhotoStrip,
  Readout,
  Screen,
  Segmented,
  SectionLabel,
  SignaturePad,
  Small,
  StatusPill,
  type Segment,
} from "@/components";
import { inspections } from "@/data/mock";
import type { Inspection, InspectionItem } from "@/types";

type Result = "OK" | "Attention" | "Failed";
const SEGMENTS: Segment<Result>[] = [
  { value: "OK", label: "OK", tone: "go" },
  { value: "Attention", label: "Attention", tone: "warn" },
  { value: "Failed", label: "Fail", tone: "stop" },
];

const BLANK_ITEMS: Omit<InspectionItem, "result">[] = [
  { name: "B1", section: "Exterior", label: "Front bumper & lights", photoCount: 0 },
  { name: "B2", section: "Exterior", label: "Bodywork — both sides", photoCount: 0 },
  { name: "B3", section: "Exterior", label: "Rear & tailgate", photoCount: 0 },
  { name: "B4", section: "Tyres", label: "Front tyres — tread & pressure", photoCount: 0 },
  { name: "B5", section: "Tyres", label: "Rear tyres — tread & pressure", photoCount: 0 },
  { name: "B6", section: "Under hood", label: "Fluids — oil, coolant, brake", photoCount: 0 },
  { name: "B7", section: "Cabin", label: "Dash warning lights", photoCount: 0 },
];

export default function InspectionDetail() {
  const { id, template } = useLocalSearchParams<{ id?: string; template?: string }>();

  const base: Inspection = useMemo(() => {
    const found = id ? inspections.find((i) => i.name === id) : undefined;
    if (found) return found;
    return {
      name: "INS-NEW",
      template: template ?? "Walk-around",
      status: "Draft",
      vehiclePlate: "—",
      vehicleLabel: "New inspection",
      inspector: "M. Osei",
      startedAt: "2026-06-28T10:34:00",
      items: BLANK_ITEMS.map((it) => ({ ...it, result: null })),
      signed: false,
    };
  }, [id, template]);

  const [items, setItems] = useState(base.items);
  const [signed, setSigned] = useState(base.signed);

  const tally = {
    OK: items.filter((i) => i.result === "OK").length,
    Attention: items.filter((i) => i.result === "Attention").length,
    Failed: items.filter((i) => i.result === "Failed").length,
  };
  const rated = tally.OK + tally.Attention + tally.Failed;
  const allRated = rated === items.length;

  const setResult = (name: string, result: Result) =>
    setItems((prev) => prev.map((it) => (it.name === name ? { ...it, result } : it)));
  const addPhoto = (name: string) =>
    setItems((prev) => prev.map((it) => (it.name === name ? { ...it, photoCount: it.photoCount + 1 } : it)));

  const sections = [...new Set(items.map((i) => i.section))];

  return (
    <View className="flex-1">
      <Screen>
        <AppHeader back eyebrow={`${base.name} · ${base.template}`} title={base.vehicleLabel} titleSize={26} />

        <View className="flex-row items-center gap-2.5">
          <StatusPill status={allRated ? "Completed" : "In Progress"} live={!allRated} />
          {base.vehiclePlate !== "—" ? (
            <Readout size={13} className="text-muted-foreground">
              {base.vehiclePlate}
            </Readout>
          ) : null}
          <Caption>· {base.inspector}</Caption>
        </View>

        {/* Summary tiles */}
        <View className="flex-row gap-2">
          <Tile value={tally.OK} label="OK" toneText="text-signal-go" />
          <Tile value={tally.Attention} label="Attention" toneText="text-signal-warn" />
          <Tile value={tally.Failed} label="Failed" toneText="text-signal-stop" />
          <Tile value={items.length - rated} label="Pending" toneText="text-muted-foreground" />
        </View>

        {/* Checklist grouped by section */}
        {sections.map((section) => (
          <View key={section} className="gap-3">
            <SectionLabel>{section}</SectionLabel>
            {items
              .filter((i) => i.section === section)
              .map((item) => (
                <Card key={item.name} compact>
                  <Bold className="mb-2.5 text-[15px]">{item.label}</Bold>
                  <Segmented segments={SEGMENTS} value={item.result as Result | null} onChange={(r) => setResult(item.name, r)} />
                  {(item.result === "Attention" || item.result === "Failed") && (
                    <View className="mt-3 gap-2">
                      <Caption>Evidence — photograph the issue</Caption>
                      <PhotoStrip count={item.photoCount} size={64} onAdd={() => addPhoto(item.name)} />
                    </View>
                  )}
                </Card>
              ))}
          </View>
        ))}

        {/* Sign-off */}
        <SectionLabel>Sign-off</SectionLabel>
        <Card>
          <Small className="mb-2.5">
            {allRated ? "Inspector signature confirms the result above." : `Rate all ${items.length} points to sign off.`}
          </Small>
          <SignaturePad signed={signed} signerName={base.inspector} onSign={() => allRated && setSigned(true)} />
        </Card>
      </Screen>

      {!signed && (
        <Fab
          label={allRated ? "Complete & sign" : `Rated ${rated}/${items.length}`}
          icon={allRated ? "checkmark-done" : "scan"}
          onPress={() => allRated && setSigned(true)}
        />
      )}
    </View>
  );
}

function Tile({ value, label, toneText }: { value: number; label: string; toneText: string }) {
  return (
    <Card compact className="flex-1 items-center py-3">
      <Readout size={22} weight="semibold" className={toneText}>
        {value}
      </Readout>
      <Caption className="mt-0.5">{label}</Caption>
    </Card>
  );
}
