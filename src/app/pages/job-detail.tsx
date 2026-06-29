import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  Divider,
  Fab,
  Icon,
  LiveDot,
  PhotoStrip,
  Readout,
  Screen,
  SectionLabel,
  SignaturePad,
  Small,
  StatusPill,
} from "@/components";
import { jobCards } from "@/data/mock";
import { elapsed, timeOf } from "@/lib/format";
import { useTheme } from "@/theme";

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette } = useTheme();

  const job = useMemo(() => jobCards.find((j) => j.name === id) ?? jobCards[0], [id]);

  const [checklist, setChecklist] = useState(job.checklist);
  const [running, setRunning] = useState(() => job.timeLogs.some((t) => !t.endedAt));
  const [activeLog] = useState(() => job.timeLogs.find((t) => !t.endedAt));
  const [photos, setPhotos] = useState(job.photoCount);
  const [signed, setSigned] = useState(job.signedOff);

  const done = checklist.filter((c) => c.done).length;
  const allDone = done === checklist.length;
  const toggle = (name: string) =>
    setChecklist((prev) => prev.map((c) => (c.name === name ? { ...c, done: !c.done } : c)));

  return (
    <View className="flex-1">
      <Screen>
        <AppHeader back eyebrow={job.name} title={job.vehicleLabel} titleSize={26} />

        <View className="flex-row flex-wrap items-center gap-2.5">
          <StatusPill status={job.status} live={running} />
          <Readout size={13} className="text-muted-foreground">
            {job.vehiclePlate}
          </Readout>
          {job.bay ? <Caption>· {job.bay}</Caption> : null}
          <Caption>· {job.customerName}</Caption>
        </View>

        {/* Time log */}
        <Card accent={running ? "bg-signal-stop" : undefined}>
          <SectionLabel>Time log</SectionLabel>
          {running && activeLog ? (
            <View className="mt-1 flex-row items-center gap-2.5">
              <LiveDot size={9} color={palette.signal.stop} />
              <View className="flex-1">
                <Bold className="text-[15px]">{activeLog.task}</Bold>
                <Readout size={13} className="text-muted-foreground">
                  Running · {elapsed(activeLog.startedAt)}
                </Readout>
              </View>
              <Button label="Stop" variant="destructive" icon="stop" small onPress={() => setRunning(false)} />
            </View>
          ) : (
            <View className="mt-1 flex-row items-center gap-2.5">
              <View className="flex-1">
                <Bold className="text-[15px]">No timer running</Bold>
                <Caption>Start the clock when you pick the job back up.</Caption>
              </View>
              <Button label="Start" icon="play" small onPress={() => setRunning(true)} />
            </View>
          )}

          {job.timeLogs.filter((t) => t.endedAt).length > 0 && (
            <>
              <Divider className="my-3" />
              {job.timeLogs
                .filter((t) => t.endedAt)
                .map((t) => (
                  <View key={t.name} className="mb-1.5 flex-row items-center">
                    <Caption className="flex-1">{t.task}</Caption>
                    <Readout size={12} className="text-muted-foreground">
                      {timeOf(t.startedAt)}–{timeOf(t.endedAt!)} · {elapsed(t.startedAt, t.endedAt)}
                    </Readout>
                  </View>
                ))}
            </>
          )}
        </Card>

        {/* Checklist */}
        <Card>
          <SectionLabel right={<Readout size={12} className="text-muted-foreground">{`${done}/${checklist.length}`}</Readout>}>
            Checklist
          </SectionLabel>
          <View className="mt-1">
            {checklist.map((task, i) => (
              <Pressable
                key={task.name}
                onPress={() => toggle(task.name)}
                className={`flex-row items-center gap-3 py-[11px] ${i === 0 ? "" : "border-t border-border"}`}
              >
                <View
                  className={`h-[26px] w-[26px] items-center justify-center rounded-sm border-[1.5px] ${
                    task.done ? "border-signal-go bg-signal-go/15" : "border-border"
                  }`}
                >
                  {task.done && <Icon name="checkmark" size={17} color={palette.signal.go} />}
                </View>
                <Bold
                  className={`flex-1 text-[14.5px] ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {task.label}
                </Bold>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Parts */}
        <Card>
          <SectionLabel right={<Caption>{job.parts.length}</Caption>}>Parts</SectionLabel>
          {job.parts.length === 0 ? (
            <Small className="mt-1">No parts logged yet.</Small>
          ) : (
            job.parts.map((p, i) => (
              <View
                key={p.name}
                className={`flex-row items-center gap-2.5 py-2.5 ${i === 0 ? "" : "border-t border-border"}`}
              >
                <View className="flex-1">
                  <Bold className="text-[14.5px]">{p.description}</Bold>
                  <Readout size={12} className="text-muted-foreground">
                    {p.partNo} · ×{p.qty}
                  </Readout>
                </View>
                <StatusPill status={p.status} small />
              </View>
            ))
          )}
          <Button
            label="Requisition a part"
            variant="secondary"
            icon="add"
            small
            block
            className="mt-3"
            onPress={() => router.push("/pages/parts")}
          />
        </Card>

        {/* Photos */}
        <Card>
          <SectionLabel right={<Caption>{photos}</Caption>}>Job photos</SectionLabel>
          <View className="mt-1.5">
            <PhotoStrip count={photos} onAdd={() => setPhotos((n) => n + 1)} />
          </View>
        </Card>

        {/* Delivery sign-off */}
        <Card>
          <SectionLabel>Delivery sign-off</SectionLabel>
          <Small className="mb-2.5">
            {allDone ? "Capture the customer signature to deliver." : "Finish the checklist before delivery."}
          </Small>
          <SignaturePad signed={signed} signerName={job.customerName} onSign={() => allDone && setSigned(true)} />
        </Card>
      </Screen>

      {!signed && (
        <Fab
          label={allDone ? "Deliver & sign off" : `Checklist ${done}/${checklist.length}`}
          icon={allDone ? "create" : "list"}
          onPress={() => allDone && setSigned(true)}
        />
      )}
    </View>
  );
}
