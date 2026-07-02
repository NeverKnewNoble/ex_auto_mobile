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
  JobsSkeleton,
  Readout,
  ScreenFrame,
  StatusPill,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { jobStatusCounts, listJobs } from "@/services";
import { dateShort, money } from "@/lib/format";
import { useTheme } from "@/theme";
import type { JobCardListRow, JobCardStatus } from "@/types/job-card";
import type { Filter, JobRowProps } from "@/types/jobs";

const STATUSES: JobCardStatus[] = [
  "Draft",
  "Approved",
  "Scheduled",
  "In Progress",
  "Quality Check",
  "Completed",
  "Invoiced",
  "Delivered",
  "Cancelled",
];

const FILTERS: Filter[] = ["All", ...STATUSES];

export default function Jobs() {
  const router = useRouter();
  const { palette } = useTheme();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const counts = useFetch(() => jobStatusCounts(), []);
  const { data: rows, loading, error, refresh } = useFetch(
    () => listJobs({ filters: filter === "All" ? undefined : { status: filter }, search }),
    [filter, search]
  );

  return (
    <View className="flex-1">
      <ScreenFrame header={<AppHeader eyebrow="Workshop floor" title="Jobs" />}>
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
            placeholder="Search jobs, plate, customer…"
            placeholderTextColor={palette.mutedForeground}
            className="flex-1 font-sans text-[15px] text-foreground"
          />
        </View>

        {loading ? (
          <JobsSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : !Array.isArray(rows) || rows.length === 0 ? (
          <EmptyState icon="construct-outline" title="No job cards" hint="Try a different filter." />
        ) : (
          rows.map((row) => (
            <JobRow
              key={row.name}
              row={row}
              onPress={() => router.push({ pathname: "/pages/job-detail", params: { id: row.name } })}
            />
          ))
        )}
      </ScreenFrame>

      <Fab label="New job" icon="add" onPress={() => router.push("/pages/job-create")} />
    </View>
  );
}

function JobRow({ row, onPress }: JobRowProps) {
  const { palette } = useTheme();
  const live = row.status === "In Progress";

  return (
    <Card onPress={onPress} accent={live ? "bg-signal-info" : undefined}>
      <View className="flex-row items-center justify-between">
        <Readout size={15} weight="semibold" className="text-muted-foreground">
          {row.name}
        </Readout>
        <StatusPill status={row.status} live={live} />
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <StatusPill status={row.priority} small />
      </View>

      <Bold className="mt-2 text-[16px]">{row.make_model}</Bold>
      <View className="mt-0.5 flex-row items-center gap-2">
        <Readout size={13} className="text-muted-foreground">
          {row.license_plate}
        </Readout>
        <Caption>· {row.customer_name}</Caption>
      </View>

      <View className="mt-3 flex-row items-center gap-2 border-t border-border pt-3">
        <Icon name="person-outline" size={15} color={palette.mutedForeground} />
        <Caption>{row.primary_technician_name || "Unassigned"}</Caption>
        <View className="flex-1" />
        <Readout size={14} weight="semibold">
          {money(row.grand_total)}
        </Readout>
        <Caption>Due {dateShort(row.expected_delivery_date)}</Caption>
      </View>
    </Card>
  );
}
