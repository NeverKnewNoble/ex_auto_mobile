import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Caption,
  Card,
  EmptyState,
  ErrorState,
  Fab,
  Icon,
  PartsSkeleton,
  Readout,
  ScreenFrame,
  StatusPill,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { getStoreKeeperSummary, listRequisitions, requisitionStatusCounts } from "@/services";
import { dateTimeShort, money } from "@/lib/format";
import { useTheme } from "@/theme";
import type { RequisitionListRow, RequisitionStatus } from "@/types/requisition";
import type { FilterChipProps, RequisitionCardProps, SearchRowProps, SummaryTileProps } from "@/types/parts";

const STATUSES: RequisitionStatus[] = [
  "Draft",
  "Pending",
  "Approved",
  "Issued",
  "Partially Issued",
  "Cancelled",
];
const CHIPS = ["All", "Urgent", ...STATUSES];

export default function Parts() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const summary = useFetch(() => getStoreKeeperSummary(), []);
  const counts = useFetch(() => requisitionStatusCounts(), []);

  const isStatus = STATUSES.includes(filter as RequisitionStatus);
  const list = useFetch(
    () =>
      listRequisitions({
        filters: isStatus ? { status: filter as RequisitionStatus } : undefined,
        urgent_only: filter === "Urgent",
        search,
      }),
    [filter, search]
  );

  return (
    <View className="flex-1">
      <ScreenFrame header={<AppHeader eyebrow="Store keeper" title="Parts" />}>
        {/* Summary tiles */}
        <View className="flex-row gap-2">
          <SummaryTile value={summary.data?.open_requisitions ?? 0} label="Open" />
          <SummaryTile value={summary.data?.urgent_requisitions ?? 0} label="Urgent" toneText="text-signal-stop" />
          <SummaryTile value={summary.data?.awaiting_issue ?? 0} label="Awaiting issue" />
          <SummaryTile value={summary.data?.short_lines ?? 0} label="Short lines" toneText="text-signal-warn" />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CHIPS.map((chip) => (
            <FilterChip
              key={chip}
              label={chip}
              active={filter === chip}
              count={STATUSES.includes(chip as RequisitionStatus) ? counts.data?.[chip] : undefined}
              onPress={() => setFilter(chip)}
            />
          ))}
        </ScrollView>

        {/* Search */}
        <SearchRow value={search} onChangeText={setSearch} />

        {/* List */}
        {list.loading ? (
          <PartsSkeleton />
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.refresh} />
        ) : !Array.isArray(list.data) || list.data.length === 0 ? (
          <EmptyState icon="cube-outline" title="No requisitions" />
        ) : (
          list.data.map((row) => (
            <RequisitionCard
              key={row.name}
              row={row}
              onPress={() => router.push({ pathname: "/pages/requisition-detail", params: { name: row.name } })}
            />
          ))
        )}
      </ScreenFrame>

      <Fab label="New requisition" icon="add" onPress={() => router.push("/pages/requisition-create")} />
    </View>
  );
}

function SummaryTile({ value, label, toneText = "text-foreground" }: SummaryTileProps) {
  return (
    <Card compact className="flex-1">
      <Readout size={22} weight="semibold" className={toneText}>
        {value}
      </Readout>
      <Caption className="mt-0.5">{label}</Caption>
    </Card>
  );
}

function FilterChip({ label, active, count, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${active ? "border-primary bg-primary/10" : "border-border bg-card"}`}
    >
      <Caption className={active ? "font-sans-bold text-primary" : "text-muted-foreground"}>{label}</Caption>
      {typeof count === "number" ? (
        <Readout size={11} weight="semibold" className={active ? "text-primary" : "text-muted-foreground"}>
          {count}
        </Readout>
      ) : null}
    </Pressable>
  );
}

function SearchRow({ value, onChangeText }: SearchRowProps) {
  const { palette } = useTheme();
  return (
    <View className="h-12 flex-row items-center gap-2 rounded-md border border-border bg-card px-3">
      <Icon name="search" size={18} color={palette.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search requisitions"
        placeholderTextColor={palette.mutedForeground}
        className="flex-1 font-sans text-[15px] text-foreground"
      />
    </View>
  );
}

function RequisitionCard({ row, onPress }: RequisitionCardProps) {
  const live = row.is_urgent && row.status !== "Issued" && row.status !== "Cancelled";
  return (
    <Card onPress={onPress}>
      <View className="flex-row items-center justify-between">
        <Readout size={15} weight="semibold">
          {row.name}
        </Readout>
        <StatusPill status={row.status} small live={live} />
      </View>

      <View className="mt-1.5 flex-row items-center gap-2">
        {row.is_urgent ? <Caption className="text-signal-stop">Urgent</Caption> : null}
        {row.job_card ? <Caption>{row.job_card}</Caption> : null}
        <Caption>· {row.requested_by_name || ""}</Caption>
      </View>

      <View className="mt-3 flex-row items-center gap-2 border-t border-border pt-3">
        <Caption>{row.items_count} lines</Caption>
        {row.short_count > 0 ? <Caption className="text-signal-stop">{row.short_count} short</Caption> : null}
        <View className="flex-1" />
        <Readout size={14} weight="semibold">
          {money(row.total_amount)}
        </Readout>
        <Caption>{dateTimeShort(row.requested_at)}</Caption>
      </View>
    </Card>
  );
}
