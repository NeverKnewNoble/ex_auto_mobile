import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  Icon,
  Readout,
  ScreenFrame,
  SectionLabel,
  Small,
  StatusPill,
  type IconName,
} from "@/components";
import { inspections, inspectionTemplates } from "@/data/mock";
import { useTheme } from "@/theme";
import type { Inspection } from "@/types";

const TEMPLATE_ICON: Record<string, IconName> = {
  "Walk-around": "car-sport-outline",
  "Pre-delivery QC": "shield-checkmark-outline",
  "Damage report": "warning-outline",
  "Brake & tyre": "disc-outline",
};

export default function Inspect() {
  const router = useRouter();
  const { palette } = useTheme();

  return (
    <ScreenFrame header={<AppHeader eyebrow="Camera-led checks" title="Inspect" />}>
      <SectionLabel>New inspection</SectionLabel>
      <View className="flex-row flex-wrap gap-2">
        {inspectionTemplates.map((tpl) => (
          <Card
            key={tpl.name}
            compact
            onPress={() => router.push({ pathname: "/pages/inspection-detail", params: { template: tpl.name } })}
            className="w-[48.5%]"
          >
            <View className="mb-2.5 h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Icon name={TEMPLATE_ICON[tpl.name] ?? "list-outline"} size={22} color={palette.primary} />
            </View>
            <Bold className="text-[15px]">{tpl.name}</Bold>
            <Small numberOfLines={2} className="mt-0.5 min-h-[36px]">
              {tpl.detail}
            </Small>
            <Readout size={11} className="mt-1.5 text-muted-foreground">
              {tpl.items} points
            </Readout>
          </Card>
        ))}
      </View>

      <SectionLabel right={<Caption>{inspections.length}</Caption>}>My inspections</SectionLabel>
      {inspections.map((ins) => (
        <InspectionRow
          key={ins.name}
          ins={ins}
          onPress={() => router.push({ pathname: "/pages/inspection-detail", params: { id: ins.name } })}
        />
      ))}
    </ScreenFrame>
  );
}

function InspectionRow({ ins, onPress }: { ins: Inspection; onPress: () => void }) {
  const rated = ins.items.filter((i) => i.result !== null).length;
  const fails = ins.items.filter((i) => i.result === "Failed").length;
  const attention = ins.items.filter((i) => i.result === "Attention").length;
  const live = ins.status === "In Progress";

  return (
    <Card onPress={onPress} accent={live ? "bg-signal-info" : undefined}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Readout size={14} weight="semibold" className="text-muted-foreground">
            {ins.name}
          </Readout>
          <Caption>·</Caption>
          <Caption>{ins.template}</Caption>
        </View>
        <StatusPill status={ins.status} live={live} small />
      </View>

      <Bold className="mt-2 text-[16px]">{ins.vehicleLabel}</Bold>
      <Readout size={13} className="mt-0.5 text-muted-foreground">
        {ins.vehiclePlate}
      </Readout>

      <View className="mt-3 flex-row items-center gap-4">
        <Tally tone="muted" icon="ellipsis-horizontal" text={`${rated}/${ins.items.length} rated`} />
        {attention > 0 && <Tally tone="warn" icon="alert-circle" text={`${attention} attention`} />}
        {fails > 0 && <Tally tone="stop" icon="close-circle" text={`${fails} failed`} />}
      </View>
    </Card>
  );
}

function Tally({ icon, text, tone }: { icon: IconName; text: string; tone: "muted" | "warn" | "stop" }) {
  const { palette } = useTheme();
  const color = tone === "warn" ? palette.signal.warn : tone === "stop" ? palette.signal.stop : palette.mutedForeground;
  const textClass = tone === "warn" ? "text-signal-warn" : tone === "stop" ? "text-signal-stop" : "text-muted-foreground";
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={15} color={color} />
      <Caption className={textClass}>{text}</Caption>
    </View>
  );
}
