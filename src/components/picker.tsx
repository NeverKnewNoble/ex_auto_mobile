import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, TextInput, View } from "react-native";
import { useTheme } from "@/theme";
import type { PickerOption } from "@/types/picker";
import { Sheet } from "./sheet";
import { Icon } from "./icon";
import { Bold, Caption, Readout, Small } from "./text";

interface PickerProps<M> {
  visible: boolean;
  onClose: () => void;
  title: string;
  load: (query: string) => Promise<PickerOption<M>[]>;
  onSelect: (option: PickerOption<M>) => void;
  placeholder?: string;
  searchable?: boolean;
  emptyText?: string;
}

/**
 * Some picker endpoints return a normalized `{ value, label }`, but the
 * `get_list` / list_* ones return raw Frappe rows (`name`, `*_name`). Derive a
 * display label and a stable value from either shape so options never render
 * blank and keyExtractor never returns undefined.
 */
function optionValue(o: unknown): string {
  const r = (o ?? {}) as Record<string, unknown>;
  return String(r.value ?? r.name ?? "");
}
function optionLabel(o: unknown): string {
  const r = (o ?? {}) as Record<string, unknown>;
  const cand =
    r.label ??
    r.customer_name ??
    r.full_name ??
    r.branch_name ??
    r.warehouse_name ??
    r.item_name ??
    r.technician_name ??
    r.employee_name ??
    r.title ??
    r.name ??
    r.value;
  return cand != null ? String(cand) : "";
}

/** Detail fields worth surfacing so the user knows exactly what they're picking. */
const DETAIL_FIELDS = [
  "license_plate",
  "make_model",
  "mobile_no",
  "email_id",
  "email",
  "customer_name",
  "branch",
  "item_code",
  "stock_uom",
  "warehouse_name",
  "full_name",
  "technician_name",
];

/**
 * A concise detail line — the explicit `sublabel` when set, otherwise built from
 * known meta/record fields (plate, make/model, phone, email…), deduped and
 * excluding the label/id already shown above.
 */
function optionDetail(o: unknown): string {
  const r = (o ?? {}) as Record<string, unknown>;
  if (r.sublabel != null && r.sublabel !== "") return String(r.sublabel);
  const meta = (r.meta ?? {}) as Record<string, unknown>;
  const parts: string[] = [];
  const seen = new Set([optionLabel(o), optionValue(o)]);
  for (const key of DETAIL_FIELDS) {
    const v = r[key] ?? meta[key];
    if (v == null || v === "") continue;
    const s = String(v);
    if (seen.has(s)) continue;
    seen.add(s);
    parts.push(s);
    if (parts.length === 3) break;
  }
  return parts.join(" · ");
}

/** Searchable typeahead in a bottom sheet. Drives every create-form link field. */
export function Picker<M = Record<string, unknown>>({
  visible,
  onClose,
  title,
  load,
  onSelect,
  placeholder = "Search…",
  searchable = true,
  emptyText = "No matches.",
}: PickerProps<M>) {
  const { palette } = useTheme();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<PickerOption<M>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setLoading(true);
    load(query)
      .then((r) => alive && setOptions(Array.isArray(r) ? r : []))
      .catch(() => alive && setOptions([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, query]);

  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  return (
    <Sheet visible={visible} onClose={onClose} title={title} full>
      {searchable && (
        <View className="mx-4 mb-2 h-12 flex-row items-center gap-2 rounded-md border border-border bg-card px-3">
          <Icon name="search" size={18} color={palette.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={palette.mutedForeground}
            autoFocus
            className="flex-1 font-sans text-[15px] text-foreground"
          />
          {loading && <ActivityIndicator size="small" color={palette.mutedForeground} />}
        </View>
      )}
      <FlatList
        data={options}
        style={{ flex: 1 }}
        keyExtractor={(o, i) => optionValue(o) || String(i)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-10">
              <Caption>{emptyText}</Caption>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const label = optionLabel(item);
          const id = optionValue(item);
          const detail = optionDetail(item);
          return (
            <Pressable
              onPress={() => {
                // Hand the form a normalized option so its `value` is never blank.
                onSelect({ ...item, value: id, label });
                onClose();
              }}
              className="flex-row items-center gap-3 border-b border-border py-3.5 active:opacity-60"
            >
              <View className="flex-1">
                <Bold className="text-[15px]">{label}</Bold>
                {/* Document ID — shown when it differs from the friendly label. */}
                {id && id !== label ? (
                  <Readout size={12} className="mt-0.5 text-muted-foreground">
                    {id}
                  </Readout>
                ) : null}
                {detail ? <Small className="mt-0.5">{detail}</Small> : null}
              </View>
              <Icon name="chevron-forward" size={18} color={palette.mutedForeground} />
            </Pressable>
          );
        }}
      />
    </Sheet>
  );
}
