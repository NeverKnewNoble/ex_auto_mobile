import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  EmptyState,
  ErrorState,
  Fab,
  Icon,
  InspectSkeleton,
  Readout,
  ScreenFrame,
  StatusPill,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { inspectionStatusCounts, listInspections } from "@/services";
import { dateShort } from "@/lib/format";
import { useTheme } from "@/theme";
import type { InspectionListRow, InspectionStatus } from "@/types/inspection";
import type { Filter, InspectionRowProps } from "@/types/inspect";
import { overallStatus } from "@/utils/inspection-detail";

const STATUSES: InspectionStatus[] = ["Draft", "In Progress", "Completed", "Failed", "Cancelled"];

const FILTERS: Filter[] = ["All", ...STATUSES];

export default function Inspect() {
  const router = useRouter();
  const { palette } = useTheme();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const counts = useFetch(() => inspectionStatusCounts(), []);
  const { data: rows, loading, error, refresh } = useFetch(
    () => listInspections({ filters: filter === "All" ? undefined : { status: filter }, search }),
    [filter, search]
  );

  return (
    <View className="flex-1">
      <ScreenFrame header={<AppHeader eyebrow="Camera-led checks" title="Inspect" />}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          className="-mx-4 px-4"
        >
          {FILTERS.map((f) => {
            const active = f === filter;
            const count = f === "All" ? undefined : counts.data?.[f];
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-[7px] ${
                  active ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <Caption className={`font-mono-semibold tracking-[0.3px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {f}
                </Caption>
                {count ? (
                  <View className="min-w-[18px] items-center rounded-full bg-primary px-1">
                    <Caption className="font-mono-semibold text-primary-foreground">{count}</Caption>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="h-12 flex-row items-center gap-2 rounded-md border border-border bg-card px-3">
          <Icon name="search" size={18} color={palette.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search inspections, plate, vehicle…"
            placeholderTextColor={palette.mutedForeground}
            className="flex-1 font-sans text-[15px] text-foreground"
          />
        </View>

        {loading ? (
          <InspectSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : !Array.isArray(rows) || rows.length === 0 ? (
          <EmptyState icon="scan-circle-outline" title="No inspections" hint="Try a different filter." />
        ) : (
          rows.map((row) => (
            <InspectionRow
              key={row.name}
              row={row}
              onPress={() => router.push({ pathname: "/pages/inspection-detail", params: { name: row.name } })}
            />
          ))
        )}
      </ScreenFrame>

      <Fab label="New inspection" icon="add" onPress={() => router.push("/pages/inspection-create")} />
    </View>
  );
}

function InspectionRow({ row, onPress }: InspectionRowProps) {
  const live = row.status === "In Progress";

  return (
    <Card onPress={onPress} accent={live ? "bg-signal-info" : undefined}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <Readout size={15} weight="semibold" className="text-muted-foreground">
            {row.name}
          </Readout>
          <Caption>· {row.inspection_type}</Caption>
        </View>
        <StatusPill status={row.status} live={live} />
      </View>

      <Bold className="mt-2 text-[16px]">{row.make_model}</Bold>
      <Readout size={13} className="mt-0.5 text-muted-foreground">
        {row.license_plate}
      </Readout>

      <View className="mt-3 flex-row items-center gap-2 border-t border-border pt-3">
        <Caption>{dateShort(row.inspection_date)}</Caption>
        <View className="flex-1" />
        {row.items_pass > 0 ? <Caption className="text-signal-go">{row.items_pass} pass</Caption> : null}
        {row.items_attention > 0 ? <Caption className="text-signal-warn">{row.items_attention} attn</Caption> : null}
        {row.items_fail > 0 ? <Caption className="text-signal-stop">{row.items_fail} fail</Caption> : null}
        {row.overall_result ? <StatusPill status={overallStatus(row.overall_result)} small /> : null}
      </View>
    </Card>
  );
}
