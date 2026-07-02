import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  ChipSelect,
  ErrorState,
  Fab,
  InspectionDetailSkeleton,
  Readout,
  Screen,
  Segmented,
  SectionLabel,
  StatusPill,
  TextField,
  type Segment,
} from "@/components";
import { useAction } from "@/hooks/use-action";
import { useFetch } from "@/hooks/use-fetch";
import {
  applyInspectionAction,
  createJobCardFromInspection,
  getInspection,
  submitInspection,
  updateInspectionItem,
} from "@/services";
import type { InspectionDetail, ItemResult, Severity } from "@/types/inspection";
import type { Result } from "@/types/inspection-detail";
import { overallStatus, patchItem } from "@/utils/inspection-detail";

const SEGMENTS: Segment<Result>[] = [
  { value: "OK", label: "OK", tone: "go" },
  { value: "Attention", label: "Attn", tone: "warn" },
  { value: "Failed", label: "Fail", tone: "stop" },
  { value: "Not Applicable", label: "N/A", tone: "info" },
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;

export default function InspectionDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { data: ins, loading, error, refresh, setData } = useFetch(() => getInspection(name), [name]);
  const { run } = useAction();

  if (loading)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Inspection" />
        <InspectionDetailSkeleton />
      </Screen>
    );
  if (error || !ins)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Inspection" />
        <ErrorState message={error ?? "Not found"} onRetry={refresh} />
      </Screen>
    );

  const editable = ins.status === "In Progress" && ins.docstatus !== 1;
  const categories = [...new Set(ins.items.map((i) => i.category))];
  const complete = ins.progress.total > 0 && ins.progress.completed === ins.progress.total;
  const pct = ins.progress.total > 0 ? ins.progress.completed / ins.progress.total : 0;

  const act = (fn: () => Promise<unknown>, success: string) => run(fn, { success, onDone: refresh });

  // Optimistic: reflect the change instantly, then reconcile against the server.
  const setResult = (idx: number, result: Result) => {
    setData((prev) => patchItem(prev!, idx, { result }));
    run(() => updateInspectionItem(ins.name, idx, { result }), { onDone: refresh });
  };
  const setSeverity = (idx: number, severity: Severity) => {
    const result = ins.items[idx].result;
    setData((prev) => patchItem(prev!, idx, { severity }));
    run(() => updateInspectionItem(ins.name, idx, { result, severity }), { onDone: refresh });
  };
  const setRemarks = (idx: number, remarks: string) => {
    const result = ins.items[idx].result;
    setData((prev) => patchItem(prev!, idx, { remarks }));
    run(() => updateInspectionItem(ins.name, idx, { result, remarks }), { onDone: refresh });
  };

  return (
    <View className="flex-1">
      <Screen>
        <AppHeader back eyebrow={`${ins.name} · ${ins.inspection_type}`} title={ins.make_model} titleSize={24} />

        <View className="flex-row flex-wrap items-center gap-2.5">
          <StatusPill status={ins.status} live={ins.status === "In Progress"} />
          <Readout size={13} className="text-muted-foreground">
            {ins.license_plate}
          </Readout>
          <Caption>· {ins.inspector_name}</Caption>
          {ins.overall_result ? <StatusPill status={overallStatus(ins.overall_result)} small /> : null}
        </View>

        {/* Progress */}
        <Card>
          <View className="flex-row items-center justify-between">
            <SectionLabel>Progress</SectionLabel>
            <Readout size={14} weight="semibold">
              {ins.progress.completed}/{ins.progress.total}
            </Readout>
          </View>
          <View className="mt-2 h-[5px] overflow-hidden rounded bg-muted">
            <View className={`h-[5px] rounded ${complete ? "bg-signal-go" : "bg-primary"}`} style={{ width: `${pct * 100}%` }} />
          </View>
          <View className="mt-3 flex-row items-center gap-4">
            <Caption className="text-signal-go">{ins.items_pass} pass</Caption>
            <Caption className="text-signal-warn">{ins.items_attention} attn</Caption>
            <Caption className="text-signal-stop">{ins.items_fail} fail</Caption>
          </View>
        </Card>

        {ins.status === "Draft" ? (
          <Button
            label="Start inspection"
            icon="play"
            block
            onPress={() => act(() => applyInspectionAction(ins.name, "Start Inspection"), "Inspection started")}
          />
        ) : null}

        {/* Items grouped by category */}
        {categories.map((category) => (
          <View key={category} className="gap-3">
            <SectionLabel>{category}</SectionLabel>
            {ins.items
              .map((item, idx) => ({ item, idx }))
              .filter(({ item }) => item.category === category)
              .map(({ item, idx }) => (
                <Card key={idx} compact>
                  <Bold className="mb-2.5 text-[15px]">
                    {item.checklist_item}
                    {item.is_mandatory ? " *" : ""}
                  </Bold>
                  <Segmented
                    segments={SEGMENTS}
                    value={item.result === "Pending" ? null : (item.result as Result)}
                    onChange={editable ? (r) => setResult(idx, r) : () => {}}
                  />
                  {item.result === "Attention" || item.result === "Failed" ? (
                    <View className="mt-3 gap-3">
                      <ChipSelect
                        label="Severity"
                        options={SEVERITIES}
                        value={item.severity ?? "Low"}
                        onChange={(s) => setSeverity(idx, s)}
                      />
                      <TextField
                        label="Remarks"
                        value={item.remarks || ""}
                        onChangeText={(t) => setRemarks(idx, t)}
                        placeholder="Note the issue…"
                        multiline
                      />
                    </View>
                  ) : null}
                </Card>
              ))}
          </View>
        ))}

        {ins.status === "Completed" || ins.status === "Failed" ? (
          !ins.job_card ? (
            <Button
              label="Create job card from inspection"
              icon="construct"
              block
              onPress={() =>
                run(() => createJobCardFromInspection(ins.name), {
                  success: "Job card created",
                  onDone: (jc) => router.replace({ pathname: "/pages/job-detail", params: { id: jc } }),
                })
              }
            />
          ) : null
        ) : null}

        {ins.job_card ? (
          <Card compact onPress={() => router.push({ pathname: "/pages/job-detail", params: { id: ins.job_card! } })}>
            <View className="flex-row items-center justify-between">
              <Caption>Job card {ins.job_card}</Caption>
              <StatusPill status="Active" small />
            </View>
          </Card>
        ) : null}
      </Screen>

      {ins.status === "In Progress" ? (
        <Fab
          label={complete ? "Submit report" : `Rated ${ins.progress.completed}/${ins.progress.total}`}
          icon="checkmark-done"
          onPress={() =>
            complete && run(() => submitInspection(ins.name), { success: "Report submitted", onDone: refresh })
          }
        />
      ) : null}
    </View>
  );
}
