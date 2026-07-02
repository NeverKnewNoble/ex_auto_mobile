import { useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  Divider,
  ErrorState,
  FieldReadout,
  Icon,
  JobDetailSkeleton,
  Picker,
  Readout,
  ReadoutRow,
  Screen,
  SectionLabel,
  Sheet,
  Small,
  StatusPill,
  Tabs,
  TextField,
  SwitchRow,
  QtyStepper,
  type TabDef,
} from "@/components";
import { useToast } from "@/components/toast";
import { useAction } from "@/hooks/use-action";
import { useFetch } from "@/hooks/use-fetch";
import {
  addJobLaborItem,
  addJobTechnician,
  addJobTimeLog,
  applyJobAction,
  createJobSalesInvoice,
  failJobQc,
  getJobCard,
  listTechnicians,
  loadJobChecklistTemplate,
  markJobDelivered,
  passJobQc,
  requestJobParts,
  searchItems,
  startJobWork,
  submitJobForQc,
  updateJobChecklistItem,
  updateJobLaborStatus,
} from "@/services";
import { dateShort, dateTimeShort, money, nowIso } from "@/lib/format";
import { useTheme } from "@/theme";
import type {
  JobAction,
  JobCardDetail,
  JobChecklistRow,
  JobLaborRow,
} from "@/types/job-card";
import type { ItemMeta, PickerOption } from "@/types/picker";
import type {
  ChecklistTabProps,
  LaborTabProps,
  Line,
  LinkLineProps,
  OverviewTabProps,
  PartsTabProps,
  ReqsTabProps,
  RequestPartsSheetProps,
  TeamTabProps,
  TimeTabProps,
  TotalRowProps,
  WorkflowBarProps,
} from "@/types/job-detail";

const TABS: TabDef[] = [
  { key: "overview", label: "OVERVIEW" },
  { key: "parts", label: "PARTS" },
  { key: "labor", label: "LABOR" },
  { key: "team", label: "TEAM" },
  { key: "checklist", label: "CHECKLIST" },
  { key: "time", label: "TIME" },
  { key: "reqs", label: "REQUISITIONS" },
];

const CHECK_RESULTS = ["", "Pass", "Fail", "N/A"] as const;
const LABOR_STATUS = ["Pending", "In Progress", "Completed"] as const;

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, loading, error, refresh } = useFetch(() => getJobCard(id), [id]);
  const [tab, setTab] = useState("overview");
  const [requesting, setRequesting] = useState(false);

  if (loading)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Job Card" />
        <JobDetailSkeleton />
      </Screen>
    );
  if (error || !job)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Job Card" />
        <ErrorState message={error ?? "Not found"} onRetry={refresh} />
      </Screen>
    );

  const tabs = TABS.map((t) =>
    t.key === "parts"
      ? { ...t, badge: job.parts.length }
      : t.key === "reqs"
        ? { ...t, badge: job.parts_requisitions.length }
        : t.key === "checklist"
          ? { ...t, badge: job.checklist.length }
          : t
  );

  return (
    <View className="flex-1">
      <Screen>
        <AppHeader back eyebrow={job.name} title={job.make_model} titleSize={24} />

        <View className="flex-row flex-wrap items-center gap-2">
          <StatusPill status={job.status} live={job.status === "In Progress"} />
          <StatusPill status={job.priority} small />
          <Readout size={13} className="text-muted-foreground">
            {job.license_plate}
          </Readout>
          <Caption>· {job.customer_name}</Caption>
        </View>

        <WorkflowBar job={job} onChanged={refresh} />

        <View className="-mx-4">
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
        </View>

        {tab === "overview" && <OverviewTab job={job} />}
        {tab === "parts" && <PartsTab job={job} />}
        {tab === "labor" && <LaborTab job={job} onChanged={refresh} />}
        {tab === "team" && <TeamTab job={job} onChanged={refresh} />}
        {tab === "checklist" && <ChecklistTab job={job} onChanged={refresh} />}
        {tab === "time" && <TimeTab job={job} onChanged={refresh} />}
        {tab === "reqs" && <ReqsTab job={job} onRequest={() => setRequesting(true)} />}
      </Screen>

      <RequestPartsSheet
        visible={requesting}
        jobName={job.name}
        onClose={() => setRequesting(false)}
        onDone={refresh}
      />
    </View>
  );
}

// ─────────────────────────── Workflow ───────────────────────────

function WorkflowBar({ job, onChanged }: WorkflowBarProps) {
  const { run, busy } = useAction();
  const [failOpen, setFailOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const act = (fn: () => Promise<unknown>, success: string) => run(fn, { success, onDone: onChanged });
  const action = (a: JobAction, success: string) => act(() => applyJobAction(job.name, a), success);

  const primary = (() => {
    switch (job.status) {
      case "Draft":
        return <Button label="Approve" icon="checkmark" loading={busy} onPress={() => action("Approve", "Job approved")} />;
      case "Approved":
      case "Scheduled":
        return <Button label="Start work" icon="play" loading={busy} onPress={() => act(() => startJobWork(job.name), "Work started")} />;
      case "In Progress":
        return <Button label="Send to QC" icon="shield-checkmark" loading={busy} onPress={() => act(() => submitJobForQc(job.name), "Sent to QC")} />;
      case "Quality Check":
        return <Button label="Pass QC" icon="checkmark-done" loading={busy} onPress={() => act(() => passJobQc(job.name), "QC passed")} />;
      case "Completed":
        return <Button label="Create invoice" icon="receipt" loading={busy} onPress={() => act(() => createJobSalesInvoice(job.name), "Invoice created")} />;
      case "Invoiced":
        return <Button label="Mark delivered" icon="car" loading={busy} onPress={() => act(() => markJobDelivered(job.name), "Delivered")} />;
      default:
        return null;
    }
  })();

  if (!primary && job.status === "Delivered") {
    return (
      <Card compact>
        <View className="flex-row items-center gap-2">
          <Icon name="checkmark-circle" size={18} color="#46C266" />
          <Small className="text-foreground">Delivered {dateTimeShort(job.delivered_at)}</Small>
        </View>
      </Card>
    );
  }

  return (
    <View className="flex-row gap-2">
      <View className="flex-1">{primary}</View>
      {job.status === "Quality Check" && (
        <Button label="Fail" variant="destructive" icon="close" onPress={() => setFailOpen(true)} />
      )}
      {job.status !== "Cancelled" && job.status !== "Delivered" && (
        <Button
          label=""
          variant="ghost"
          icon="ban"
          onPress={() => run(() => applyJobAction(job.name, "Cancel"), { success: "Job cancelled", onDone: onChanged })}
        />
      )}

      <Sheet visible={failOpen} onClose={() => setFailOpen(false)} title="Fail QC" height={0.5}>
        <View className="gap-3 px-4 pt-2">
          <TextField label="Reason" required value={remarks} onChangeText={setRemarks} placeholder="What failed inspection?" multiline />
          <Button
            label="Fail QC & reopen"
            variant="destructive"
            icon="close"
            block
            disabled={!remarks.trim()}
            onPress={() =>
              run(() => failJobQc(job.name, remarks.trim()), {
                success: "Sent back to work",
                onDone: () => {
                  setFailOpen(false);
                  setRemarks("");
                  onChanged();
                },
              })
            }
          />
        </View>
      </Sheet>
    </View>
  );
}

// ─────────────────────────── Tabs ───────────────────────────

function OverviewTab({ job }: OverviewTabProps) {
  return (
    <>
      <Card>
        <SectionLabel>Complaint</SectionLabel>
        <Small className="mt-1 text-foreground">{job.customer_complaints}</Small>
        {job.diagnosis_summary ? (
          <>
            <Divider className="my-3" />
            <Caption>Diagnosis</Caption>
            <Small className="mt-1">{job.diagnosis_summary}</Small>
          </>
        ) : null}
        {job.service_advisor_notes ? (
          <>
            <Divider className="my-3" />
            <Caption>Advisor notes (internal)</Caption>
            <Small className="mt-1">{job.service_advisor_notes}</Small>
          </>
        ) : null}
      </Card>

      <Card>
        <SectionLabel>Customer & vehicle</SectionLabel>
        <ReadoutRow>
          <FieldReadout flex label="Customer" value={job.customer_name} />
          <FieldReadout flex label="Mobile" value={job.customer_mobile} />
        </ReadoutRow>
        <Divider className="my-3" />
        <ReadoutRow>
          <FieldReadout flex label="Plate" value={job.license_plate} />
          <FieldReadout flex label="Odometer" value={`${job.odometer_reading.toLocaleString()} km`} />
        </ReadoutRow>
        <Divider className="my-3" />
        <ReadoutRow>
          <FieldReadout flex label="Branch" value={job.branch} />
          <FieldReadout flex label="Fuel" value={job.fuel_level || "—"} />
        </ReadoutRow>
      </Card>

      <Card>
        <SectionLabel>Totals</SectionLabel>
        <TotalRow label="Parts" value={money(job.parts_total)} />
        <TotalRow label="Labor" value={money(job.labor_total)} />
        {job.discount_amount > 0 ? <TotalRow label="Discount" value={`– ${money(job.discount_amount)}`} /> : null}
        <TotalRow label="Tax" value={money(job.tax_amount)} />
        <Divider className="my-2" />
        <View className="flex-row items-center justify-between">
          <Bold className="text-[15px]">Grand total</Bold>
          <Readout size={18} weight="semibold">
            {money(job.grand_total)}
          </Readout>
        </View>
      </Card>

      <Card>
        <SectionLabel>Schedule & links</SectionLabel>
        <ReadoutRow>
          <FieldReadout flex label="Posted" value={dateShort(job.posting_date)} />
          <FieldReadout flex label="Due" value={dateShort(job.expected_delivery_date)} />
        </ReadoutRow>
        {(job.service_estimate || job.sales_invoice) && (
          <View className="mt-3 gap-1.5">
            {job.service_estimate ? <LinkLine icon="document-text-outline" label={job.service_estimate} /> : null}
            {job.sales_invoice ? <LinkLine icon="receipt-outline" label={job.sales_invoice} /> : null}
          </View>
        )}
      </Card>
    </>
  );
}

function PartsTab({ job }: PartsTabProps) {
  if (job.parts.length === 0) return <Card><Small>No parts on this job yet. Use Request parts to add them.</Small></Card>;
  return (
    <Card>
      {job.parts.map((p, i) => (
        <View key={`${p.item_code}-${i}`} className={`gap-1.5 py-3 ${i === 0 ? "" : "border-t border-border"}`}>
          <View className="flex-row items-center justify-between">
            <Bold className="flex-1 text-[14.5px]">{p.item_name}</Bold>
            <Readout size={14} weight="semibold">
              {money(p.amount)}
            </Readout>
          </View>
          <View className="flex-row items-center gap-2">
            <Readout size={12} className="text-muted-foreground">
              {p.item_code}
            </Readout>
            <Caption>· {p.qty} {p.uom} × {money(p.rate)}</Caption>
            <View className="flex-1" />
            <StatusPill status={p.is_issued ? "Issued" : p.is_reserved ? "Approved" : "Pending"} small />
          </View>
        </View>
      ))}
    </Card>
  );
}

function LaborTab({ job, onChanged }: LaborTabProps) {
  const { run } = useAction();
  const [open, setOpen] = useState(false);
  const [service, setService] = useState("");
  const [hours, setHours] = useState("1");

  const cycleStatus = (row: JobLaborRow, idx: number) => {
    const next = LABOR_STATUS[(LABOR_STATUS.indexOf(row.status) + 1) % LABOR_STATUS.length];
    run(() => updateJobLaborStatus(job.name, idx, next), { success: `Labor: ${next}`, onDone: onChanged });
  };

  return (
    <>
      {job.labor_items.length === 0 ? (
        <Card><Small>No labor lines yet.</Small></Card>
      ) : (
        <Card>
          {job.labor_items.map((l, i) => (
            <View key={i} className={`gap-2 py-3 ${i === 0 ? "" : "border-t border-border"}`}>
              <View className="flex-row items-center justify-between">
                <Bold className="flex-1 text-[14.5px]">{l.service_name}</Bold>
                <Readout size={14} weight="semibold">{money(l.amount)}</Readout>
              </View>
              <View className="flex-row items-center gap-2">
                <Caption>{l.actual_hours ?? l.estimated_hours}h × {money(l.rate)}</Caption>
                <View className="flex-1" />
                <Pressable onPress={() => cycleStatus(l, i)}>
                  <StatusPill status={l.status} small />
                </Pressable>
              </View>
            </View>
          ))}
        </Card>
      )}
      <Button label="Add labor line" variant="secondary" icon="add" block onPress={() => setOpen(true)} />

      <Sheet visible={open} onClose={() => setOpen(false)} title="Add labor" height={0.55}>
        <View className="gap-3 px-4 pt-2">
          <TextField label="Service type" required value={service} onChangeText={setService} placeholder="e.g. Brake service" />
          <TextField label="Estimated hours" value={hours} onChangeText={setHours} keyboardType="number-pad" mono />
          <Button
            label="Add line"
            icon="add"
            block
            disabled={!service.trim()}
            onPress={() =>
              run(() => addJobLaborItem(job.name, { service_type: service.trim(), estimated_hours: Number(hours) || 1 }), {
                success: "Labor added",
                onDone: () => {
                  setOpen(false);
                  setService("");
                  setHours("1");
                  onChanged();
                },
              })
            }
          />
        </View>
      </Sheet>
    </>
  );
}

function TeamTab({ job, onChanged }: TeamTabProps) {
  const { run } = useAction();
  const [pick, setPick] = useState(false);
  return (
    <>
      {job.technicians.length === 0 ? (
        <Card><Small>No technicians assigned.</Small></Card>
      ) : (
        <Card>
          {job.technicians.map((t, i) => (
            <View key={i} className={`flex-row items-center gap-3 py-3 ${i === 0 ? "" : "border-t border-border"}`}>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Icon name="person" size={16} color="#E11D2A" />
              </View>
              <View className="flex-1">
                <Bold className="text-[14.5px]">{t.technician_name}</Bold>
                <Caption>{t.role ?? "Technician"} · {t.actual_hours ?? 0}/{t.allocated_hours ?? 0}h</Caption>
              </View>
              {(t.is_primary === 1 || t.is_primary === true) && <StatusPill status="Active" small />}
            </View>
          ))}
        </Card>
      )}
      <Button label="Assign technician" variant="secondary" icon="person-add" block onPress={() => setPick(true)} />
      <Picker
        visible={pick}
        onClose={() => setPick(false)}
        title="Assign technician"
        load={(q) => listTechnicians(q)}
        onSelect={(o) =>
          run(() => addJobTechnician(job.name, { technician: o.value }), { success: `${o.label} assigned`, onDone: onChanged })
        }
      />
    </>
  );
}

function ChecklistTab({ job, onChanged }: ChecklistTabProps) {
  const { run } = useAction();
  const { palette } = useTheme();
  const [tplOpen, setTplOpen] = useState(false);

  const cycle = (row: JobChecklistRow, idx: number) => {
    const next = CHECK_RESULTS[(CHECK_RESULTS.indexOf(row.result) + 1) % CHECK_RESULTS.length];
    run(() => updateJobChecklistItem(job.name, idx, next), { onDone: onChanged });
  };
  const tone = (r: string) => (r === "Pass" ? "Active" : r === "Fail" ? "Failed" : r === "N/A" ? "Draft" : "Pending");

  return (
    <>
      {job.checklist.length === 0 ? (
        <Card><Small>No checklist yet. Load one from a template.</Small></Card>
      ) : (
        <Card>
          {job.checklist.map((c, i) => (
            <Pressable key={i} onPress={() => cycle(c, i)} className={`flex-row items-center gap-3 py-3 ${i === 0 ? "" : "border-t border-border"}`}>
              <View className="flex-1">
                <Bold className="text-[14px]">{c.checklist_item}</Bold>
                <Caption>{c.category}{c.is_mandatory ? " · required" : ""}</Caption>
              </View>
              {c.result ? <StatusPill status={tone(c.result)} small /> : <Icon name="ellipse-outline" size={20} color={palette.mutedForeground} />}
            </Pressable>
          ))}
        </Card>
      )}
      <Button label="Load from template" variant="secondary" icon="duplicate" block onPress={() => setTplOpen(true)} />
      <Picker
        visible={tplOpen}
        onClose={() => setTplOpen(false)}
        title="Checklist template"
        searchable={false}
        load={async () => [
          { value: "Standard Service", label: "Standard Service", sublabel: "6 points" },
          { value: "Pre-delivery QC", label: "Pre-delivery QC", sublabel: "3 points" },
        ]}
        onSelect={(o) => run(() => loadJobChecklistTemplate(job.name, o.value), { success: "Checklist loaded", onDone: onChanged })}
      />
    </>
  );
}

function TimeTab({ job, onChanged }: TimeTabProps) {
  const { run } = useAction();
  const [open, setOpen] = useState(false);
  const [op, setOp] = useState("");
  const [hours, setHours] = useState("1");
  const [billable, setBillable] = useState(true);

  return (
    <>
      {job.time_logs.length === 0 ? (
        <Card><Small>No time logged.</Small></Card>
      ) : (
        <Card>
          {job.time_logs.map((t, i) => (
            <View key={i} className={`gap-1 py-3 ${i === 0 ? "" : "border-t border-border"}`}>
              <View className="flex-row items-center justify-between">
                <Bold className="flex-1 text-[14px]">{t.operation}</Bold>
                <Readout size={13} weight="semibold">{t.duration_hours}h</Readout>
              </View>
              <View className="flex-row items-center gap-2">
                <Caption>{t.technician_name}</Caption>
                <Caption>· {dateTimeShort(t.from_time)}</Caption>
                <View className="flex-1" />
                {(t.billable === 1 || t.billable === true) ? <Caption className="text-signal-go">Billable</Caption> : <Caption>Non-billable</Caption>}
              </View>
            </View>
          ))}
        </Card>
      )}
      <Button label="Log time" variant="secondary" icon="time" block onPress={() => setOpen(true)} />

      <Sheet visible={open} onClose={() => setOpen(false)} title="Log time" height={0.6}>
        <View className="gap-3 px-4 pt-2">
          <TextField label="Operation" required value={op} onChangeText={setOp} placeholder="e.g. Replace brake pads" />
          <TextField label="Hours" value={hours} onChangeText={setHours} keyboardType="number-pad" mono />
          <SwitchRow label="Billable" value={billable} onValueChange={setBillable} />
          <Button
            label="Add time log"
            icon="add"
            block
            disabled={!op.trim()}
            onPress={() => {
              const from = nowIso();
              const to = new Date(Date.now() + (Number(hours) || 1) * 3_600_000).toISOString();
              run(() => addJobTimeLog(job.name, { operation: op.trim(), from_time: from, to_time: to, billable }), {
                success: "Time logged",
                onDone: () => {
                  setOpen(false);
                  setOp("");
                  setHours("1");
                  onChanged();
                },
              });
            }}
          />
        </View>
      </Sheet>
    </>
  );
}

function ReqsTab({ job, onRequest }: ReqsTabProps) {
  const router = useRouter();
  return (
    <>
      {job.parts_requisitions.length === 0 ? (
        <Card><Small>No parts requisitions raised from this job yet.</Small></Card>
      ) : (
        job.parts_requisitions.map((r) => (
          <Card key={r.name} compact onPress={() => router.push({ pathname: "/pages/requisition-detail", params: { name: r.name } })}>
            <View className="flex-row items-center justify-between">
              <Readout size={14} weight="semibold">{r.name}</Readout>
              <StatusPill status={r.status} small live={r.is_urgent && r.status !== "Issued"} />
            </View>
            <View className="mt-1.5 flex-row items-center gap-2">
              {r.is_urgent ? <Caption className="text-signal-stop">Urgent</Caption> : null}
              <View className="flex-1" />
              <Readout size={13} className="text-muted-foreground">{money(r.total_amount)}</Readout>
              <Icon name="chevron-forward" size={16} color="#9395A0" />
            </View>
          </Card>
        ))
      )}
      <Button label="Request parts" icon="cube" block onPress={onRequest} />
    </>
  );
}

// ─────────────────────────── Request Parts dialog ───────────────────────────

function RequestPartsSheet({ visible, jobName, onClose, onDone }: RequestPartsSheetProps) {
  const { run, busy } = useAction();
  const toast = useToast();
  const [lines, setLines] = useState<Line[]>([]);
  const [urgent, setUrgent] = useState(false);
  const [notes, setNotes] = useState("");
  const [pick, setPick] = useState(false);

  const addItem = (o: PickerOption<ItemMeta>) => {
    if (lines.some((l) => l.item_code === o.value)) {
      toast.show("Already added");
      return;
    }
    setLines((p) => [...p, { item_code: o.value, item_name: o.label, qty: 1, uom: o.meta?.stock_uom ?? "Nos", rate: o.meta?.standard_rate ?? 0 }]);
  };
  const setQty = (code: string, qty: number) => setLines((p) => p.map((l) => (l.item_code === code ? { ...l, qty } : l)));
  const remove = (code: string) => setLines((p) => p.filter((l) => l.item_code !== code));

  const submit = () =>
    run(
      () =>
        requestJobParts(
          jobName,
          lines.map((l) => ({ item_code: l.item_code, qty: l.qty, uom: l.uom })),
          notes.trim() || undefined,
          urgent
        ),
      {
        success: "Requisition raised",
        onDone: () => {
          setLines([]);
          setNotes("");
          setUrgent(false);
          onClose();
          onDone();
        },
      }
    );

  return (
    <Sheet visible={visible} onClose={onClose} title="Request parts">
      <View className="gap-3 px-4 pt-1" style={{ flexShrink: 1 }}>
        {lines.map((l) => (
          <View key={l.item_code} className="flex-row items-center gap-3 rounded-md border border-border bg-card p-3">
            <View className="flex-1">
              <Bold className="text-[14px]">{l.item_name}</Bold>
              <Caption>{l.item_code} · {l.uom}</Caption>
            </View>
            <QtyStepper value={l.qty} onChange={(n) => setQty(l.item_code, n)} />
            <Pressable onPress={() => remove(l.item_code)} hitSlop={8}>
              <Icon name="trash-outline" size={18} color="#E11D2A" />
            </Pressable>
          </View>
        ))}

        <Button label="Add part" variant="secondary" icon="search" block onPress={() => setPick(true)} />
        <SwitchRow label="Urgent" hint="Flag for immediate pick" value={urgent} onValueChange={setUrgent} />
        <TextField label="Notes" value={notes} onChangeText={setNotes} placeholder="Front axle only…" multiline />
        <Button label={`Submit requisition (${lines.length})`} icon="paper-plane" block loading={busy} disabled={lines.length === 0} onPress={submit} />
      </View>

      <Picker<ItemMeta>
        visible={pick}
        onClose={() => setPick(false)}
        title="Add part"
        load={(q) => searchItems(q, true)}
        onSelect={addItem}
      />
    </Sheet>
  );
}

// ─────────────────────────── small bits ───────────────────────────

function TotalRow({ label, value }: TotalRowProps) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Caption>{label}</Caption>
      <Readout size={13}>{value}</Readout>
    </View>
  );
}

function LinkLine({ icon, label }: LinkLineProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size={15} color="#9395A0" />
      <Readout size={13} className="text-muted-foreground">{label}</Readout>
    </View>
  );
}
