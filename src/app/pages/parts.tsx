import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import {
  Bold,
  Button,
  Caption,
  Card,
  Icon,
  Readout,
  ScreenFrame,
  SectionLabel,
  StatusPill,
  AppHeader,
} from "@/components";
import { requisitions } from "@/data/mock";
import { timeOf } from "@/lib/format";
import { useTheme } from "@/theme";
import type { Requisition } from "@/types";

export default function Parts() {
  const { palette } = useTheme();
  const [partNo, setPartNo] = useState("");
  const [qty, setQty] = useState(1);

  return (
    <ScreenFrame header={<AppHeader eyebrow="Request from the floor" title="Parts" />}>
      {/* Quick requisition composer */}
      <Card>
        <SectionLabel>Quick request</SectionLabel>
        <View className="mt-1.5 h-12 flex-row items-center gap-2 rounded-md border border-border bg-background px-3">
          <Icon name="barcode-outline" size={20} color={palette.mutedForeground} />
          <TextInput
            value={partNo}
            onChangeText={setPartNo}
            placeholder="Part number or scan"
            placeholderTextColor={palette.mutedForeground}
            autoCapitalize="characters"
            className="flex-1 font-mono text-[14px] text-foreground"
          />
        </View>

        <View className="mt-3 flex-row items-center gap-3">
          <Caption>Qty</Caption>
          <Stepper value={qty} onChange={setQty} />
          <View className="flex-1" />
          <Button label="Send request" icon="paper-plane" small onPress={() => setPartNo("")} />
        </View>
      </Card>

      <SectionLabel right={<Caption>{requisitions.length} open</Caption>}>My requests</SectionLabel>
      {requisitions.map((req) => (
        <RequisitionRow key={req.name} req={req} />
      ))}
    </ScreenFrame>
  );
}

function RequisitionRow({ req }: { req: Requisition }) {
  return (
    <Card compact>
      <View className="flex-row items-center justify-between">
        <Readout size={13} weight="semibold" className="text-muted-foreground">
          {req.partNo}
        </Readout>
        <StatusPill status={req.status} small />
      </View>
      <Bold className="mt-1.5 text-[15px]">{req.description}</Bold>
      <View className="mt-2 flex-row items-center gap-2.5">
        <Caption>Qty</Caption>
        <Readout size={13}>{req.qty}</Readout>
        <Caption>·</Caption>
        <Readout size={12} className="text-muted-foreground">
          {req.forJob}
        </Readout>
        <View className="flex-1" />
        <Caption>{timeOf(req.requestedAt)}</Caption>
      </View>
    </Card>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const btn = (icon: "remove" | "add", delta: number) => (
    <Pressable
      onPress={() => onChange(Math.max(1, value + delta))}
      className="h-9 w-9 items-center justify-center rounded-sm border border-border bg-secondary active:opacity-80"
    >
      <Icon name={icon} size={18} />
    </Pressable>
  );
  return (
    <View className="flex-row items-center gap-2.5">
      {btn("remove", -1)}
      <Readout size={16} weight="semibold" className="min-w-[18px] text-center">
        {value}
      </Readout>
      {btn("add", 1)}
    </View>
  );
}
