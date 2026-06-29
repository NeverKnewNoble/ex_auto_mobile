import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Caption,
  Card,
  Icon,
  Readout,
  ScreenFrame,
  Small,
  StatusPill,
  type IconName,
} from "@/components";
import { jobCards, CURRENT_TECH } from "@/data/mock";
import { elapsed } from "@/lib/format";
import { useTheme } from "@/theme";
import type { JobCard } from "@/types";

const FILTERS = ["All", "In Progress", "Quality Check", "Delivered"] as const;
type Filter = (typeof FILTERS)[number];

export default function Jobs() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");
  const jobs = jobCards.filter((j) => filter === "All" || j.status === filter);

  return (
    <ScreenFrame header={<AppHeader eyebrow={`Assigned to ${CURRENT_TECH}`} title="Jobs" />}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        className="-mx-4 px-4"
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-[7px] ${
                active ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              <Caption className={`font-mono-semibold tracking-[0.3px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                {f}
              </Caption>
            </Pressable>
          );
        })}
      </ScrollView>

      {jobs.map((job) => (
        <JobRow
          key={job.name}
          job={job}
          onPress={() => router.push({ pathname: "/pages/job-detail", params: { id: job.name } })}
        />
      ))}
    </ScreenFrame>
  );
}

function JobRow({ job, onPress }: { job: JobCard; onPress: () => void }) {
  const running = job.timeLogs.find((t) => !t.endedAt);
  const doneCount = job.checklist.filter((c) => c.done).length;
  const pct = doneCount / job.checklist.length;

  return (
    <Card onPress={onPress} accent={running ? "bg-signal-stop" : undefined}>
      <View className="flex-row items-center justify-between">
        <Readout size={15} weight="semibold" className="text-muted-foreground">
          {job.name}
        </Readout>
        <StatusPill status={job.status} live={!!running} small />
      </View>

      <Bold className="mt-2 text-[16px]">{job.vehicleLabel}</Bold>
      <View className="mt-0.5 flex-row items-center gap-2">
        <Readout size={13} className="text-muted-foreground">
          {job.vehiclePlate}
        </Readout>
        {job.bay ? (
          <>
            <Caption>·</Caption>
            <Caption>{job.bay}</Caption>
          </>
        ) : null}
      </View>

      <Small numberOfLines={1} className="mt-2">
        {job.complaint}
      </Small>

      {/* Checklist progress */}
      <View className="mt-3 gap-1.5">
        <View className="flex-row justify-between">
          <Caption>Checklist</Caption>
          <Readout size={12} className="text-muted-foreground">
            {doneCount}/{job.checklist.length}
          </Readout>
        </View>
        <View className="h-[5px] overflow-hidden rounded-[3px] bg-muted">
          <View
            className={`h-[5px] rounded-[3px] ${pct === 1 ? "bg-signal-go" : "bg-primary"}`}
            style={{ width: `${pct * 100}%` }}
          />
        </View>
      </View>

      <View className="mt-3 flex-row items-center gap-4 border-t border-border pt-3">
        {running ? (
          <Meta icon="ellipse" text={`Running ${elapsed(running.startedAt)}`} running />
        ) : (
          <Meta icon="time-outline" text={`${job.timeLogs.length} log${job.timeLogs.length === 1 ? "" : "s"}`} />
        )}
        <Meta icon="cube-outline" text={`${job.parts.length} parts`} />
        <Meta icon="camera-outline" text={`${job.photoCount}`} />
      </View>
    </Card>
  );
}

function Meta({ icon, text, running }: { icon: IconName; text: string; running?: boolean }) {
  const { palette } = useTheme();
  const color = running ? palette.signal.stop : palette.mutedForeground;
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={icon === "ellipse" ? 9 : 15} color={color} />
      <Caption className={running ? "text-signal-stop" : ""}>{text}</Caption>
    </View>
  );
}
