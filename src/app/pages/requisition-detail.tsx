import { View } from "react-native";
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
  RequisitionDetailSkeleton,
  Readout,
  ReadoutRow,
  Screen,
  SectionLabel,
  Small,
  StatusPill,
} from "@/components";
import { useAction } from "@/hooks/use-action";
import { useFetch } from "@/hooks/use-fetch";
import {
  applyRequisitionAction,
  approveRequisition,
  cancelRequisition,
  checkItemAvailability,
  deleteRequisition,
  getRequisition,
  issueRequisition,
} from "@/services";
import { dateTimeShort, money } from "@/lib/format";
import { useTheme } from "@/theme";
import { lineState, shortQty, type RequisitionDetail, type RequisitionItem } from "@/types/requisition";
import type { ActionButtonsProps, ItemRowProps, ReadyTileProps } from "@/types/requisition-detail";

export default function RequisitionDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { data: req, loading, error, refresh } = useFetch(() => getRequisition(name), [name]);
  const { run, busy } = useAction();

  if (loading)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Requisition" />
        <RequisitionDetailSkeleton />
      </Screen>
    );
  if (error || !req)
    return (
      <Screen scroll={false}>
        <AppHeader back title="Requisition" />
        <ErrorState message={error ?? "Not found"} onRetry={refresh} />
      </Screen>
    );

  const act = (fn: () => Promise<unknown>, success: string) => run(fn, { success, onDone: refresh });

  const checkStock = () =>
    run(() => checkItemAvailability(req.items.map((i) => ({ item_code: i.item_code, warehouse: i.warehouse })), req.warehouse), {
      success: "Stock refreshed",
      onDone: refresh,
    });

  const canDelete = !req.stock_entry && ["Draft", "Pending", "Cancelled"].includes(req.status);

  return (
    <View className="flex-1">
      <Screen>
        <AppHeader back eyebrow={req.name} title={req.job_card ?? "Requisition"} titleSize={24} />

        <View className="flex-row flex-wrap items-center gap-2">
          <StatusPill status={req.status} live={req.is_urgent && req.status !== "Issued" && req.status !== "Cancelled"} />
          {req.is_urgent ? <StatusPill status="Overdue" small /> : null}
          <Caption>· {req.branch}</Caption>
          {req.warehouse ? <Caption>· {req.warehouse}</Caption> : null}
        </View>

        {/* Readiness */}
        <View className="flex-row gap-2">
          <ReadyTile value={req.readiness.total} label="Lines" toneText="text-foreground" />
          <ReadyTile value={req.readiness.ready} label="Ready" toneText="text-signal-go" />
          <ReadyTile value={req.readiness.short} label="Short" toneText="text-signal-stop" />
          <ReadyTile value={req.readiness.issued} label="Issued" toneText="text-signal-info" />
        </View>

        <Button label="Check stock" variant="secondary" icon="refresh" block loading={busy} onPress={checkStock} />

        {/* Items */}
        <SectionLabel right={<Readout size={12} className="text-muted-foreground">{money(req.total_amount)}</Readout>}>
          Items
        </SectionLabel>
        {req.items.map((it, i) => (
          <ItemRow key={`${it.item_code}-${i}`} item={it} />
        ))}

        {/* Meta */}
        <Card>
          <SectionLabel>Request</SectionLabel>
          <ReadoutRow>
            <FieldReadout flex label="Requested by" value={req.requested_by_name ?? "—"} />
            <FieldReadout flex label="Requested" value={dateTimeShort(req.requested_at)} />
          </ReadoutRow>
          {req.approved_by_name ? (
            <>
              <Divider className="my-3" />
              <ReadoutRow>
                <FieldReadout flex label="Approved by" value={req.approved_by_name} />
                <FieldReadout flex label="Approved" value={dateTimeShort(req.approved_at)} />
              </ReadoutRow>
            </>
          ) : null}
          {req.issued_by_name ? (
            <>
              <Divider className="my-3" />
              <ReadoutRow>
                <FieldReadout flex label="Issued by" value={req.issued_by_name} />
                <FieldReadout flex label="Stock entry" value={req.stock_entry ?? "—"} />
              </ReadoutRow>
            </>
          ) : null}
          {req.notes ? (
            <>
              <Divider className="my-3" />
              <Caption>Notes</Caption>
              <Small className="mt-1">{req.notes}</Small>
            </>
          ) : null}
        </Card>

        {/* Actions */}
        <View className="gap-2">
          <ActionButtons req={req} act={act} busy={busy} />
          {canDelete && (
            <Button
              label="Delete requisition"
              variant="ghost"
              icon="trash-outline"
              block
              onPress={() =>
                run(() => deleteRequisition(req.name), {
                  success: "Requisition deleted",
                  onDone: () => router.back(),
                })
              }
            />
          )}
        </View>
      </Screen>
    </View>
  );
}

function ActionButtons({ req, act, busy }: ActionButtonsProps) {
  switch (req.status) {
    case "Draft":
      return <Button label="Submit for approval" icon="paper-plane" block loading={busy} onPress={() => act(() => applyRequisitionAction(req.name, "Submit"), "Submitted")} />;
    case "Pending":
      return (
        <View className="flex-row gap-2">
          <View className="flex-1"><Button label="Approve" icon="checkmark" block loading={busy} onPress={() => act(() => approveRequisition(req.name), "Approved")} /></View>
          <Button label="Cancel" variant="ghost" icon="ban" onPress={() => act(() => cancelRequisition(req.name), "Cancelled")} />
        </View>
      );
    case "Approved":
      return (
        <View className="gap-2">
          <Button label="Issue all ready lines" icon="cube" block loading={busy} onPress={() => act(() => issueRequisition(req.name), "Issued")} />
          <View className="flex-row gap-2">
            <View className="flex-1"><Button label="Partial issue" variant="secondary" icon="layers" block onPress={() => act(() => applyRequisitionAction(req.name, "Partial Issue"), "Partially issued")} /></View>
            <Button label="Cancel" variant="ghost" icon="ban" onPress={() => act(() => cancelRequisition(req.name), "Cancelled")} />
          </View>
        </View>
      );
    case "Partially Issued":
      return <Button label="Issue remaining ready lines" icon="cube" block loading={busy} onPress={() => act(() => issueRequisition(req.name), "Issued")} />;
    default:
      return null;
  }
}

function ItemRow({ item }: ItemRowProps) {
  const { palette } = useTheme();
  const state = lineState(item);
  const short = shortQty(item);
  const status = state === "issued" ? "Issued" : state === "ready" ? "Available" : "Awaiting Parts";

  return (
    <Card compact accent={state === "short" ? "bg-signal-stop" : state === "ready" ? "bg-signal-go" : "bg-signal-info"}>
      <View className="flex-row items-center justify-between">
        <Bold className="flex-1 text-[14.5px]">{item.item_name}</Bold>
        <Readout size={14} weight="semibold">{money(item.amount)}</Readout>
      </View>
      <View className="mt-1 flex-row items-center gap-2">
        <Readout size={12} className="text-muted-foreground">{item.item_code}</Readout>
        <Caption>· need {item.qty} {item.uom}</Caption>
        <View className="flex-1" />
        <StatusPill status={status} small />
      </View>
      <View className="mt-2 flex-row items-center gap-1.5">
        <Icon name="cube-outline" size={13} color={palette.mutedForeground} />
        <Caption>In stock: {item.available_qty} {item.uom}</Caption>
        {short > 0 ? <Caption className="text-signal-stop">· short {short}</Caption> : null}
      </View>
    </Card>
  );
}

function ReadyTile({ value, label, toneText }: ReadyTileProps) {
  return (
    <Card compact className="flex-1 items-center py-3">
      <Readout size={22} weight="semibold" className={toneText}>{value}</Readout>
      <Caption className="mt-0.5">{label}</Caption>
    </Card>
  );
}
