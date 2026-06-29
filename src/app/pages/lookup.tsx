import { useState } from "react";
import { TextInput, View } from "react-native";
import {
  AppHeader,
  Bold,
  Button,
  Caption,
  Card,
  Divider,
  FieldReadout,
  Icon,
  Readout,
  ReadoutRow,
  Screen,
  SectionLabel,
  Small,
  StatusPill,
} from "@/components";
import { serviceHistory, vehicles } from "@/data/mock";
import { num } from "@/lib/format";
import { useTheme } from "@/theme";
import type { Vehicle } from "@/types";

export default function Lookup() {
  const { palette } = useTheme();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const q = query.trim().toLowerCase();
  const matches = q
    ? vehicles.filter((v) => [v.plate, v.make, v.model, v.customer, v.vin].some((f) => f.toLowerCase().includes(q)))
    : vehicles;

  return (
    <Screen>
      <AppHeader back eyebrow="Read-only · at the car" title="Lookup" />

      {/* Search field */}
      <View className="h-[50px] flex-row items-center gap-2 rounded-md border border-border bg-card px-3">
        <Icon name="search" size={20} color={palette.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setSelected(null);
          }}
          placeholder="Plate, VIN, or customer"
          placeholderTextColor={palette.mutedForeground}
          autoCapitalize="characters"
          className="flex-1 font-sans text-[15px] text-foreground"
        />
      </View>
      <Button label="Scan plate" icon="scan" variant="secondary" block onPress={() => setQuery("GR 4471-21")} />

      {selected ? (
        <VehicleDetail vehicle={selected} onClose={() => setSelected(null)} />
      ) : (
        <>
          <SectionLabel right={<Caption>{matches.length}</Caption>}>{q ? "Matches" : "Recent vehicles"}</SectionLabel>
          {matches.map((v) => (
            <Card key={v.name} onPress={() => setSelected(v)} compact>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Readout size={15} weight="semibold">
                    {v.plate}
                  </Readout>
                  <Small className="mt-0.5">
                    {v.year} {v.make} {v.model} · {v.customer}
                  </Small>
                </View>
                <StatusPill status={v.warrantyStatus === "Active" ? "Active" : v.warrantyStatus} small />
                <Icon name="chevron-forward" size={18} color={palette.mutedForeground} />
              </View>
            </Card>
          ))}
          {matches.length === 0 && (
            <Card>
              <Small>No vehicle matches “{query}”. Check the plate or scan again.</Small>
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

function VehicleDetail({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const history = serviceHistory[vehicle.plate] ?? [];

  return (
    <>
      <View className="mt-1 flex-row items-center justify-between">
        <Bold className="text-[18px]">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Bold>
        <Caption className="text-accent" onPress={onClose}>
          Clear
        </Caption>
      </View>

      <Card>
        <ReadoutRow>
          <FieldReadout flex label="Plate" value={vehicle.plate} />
          <FieldReadout flex label="Odometer" value={`${num(vehicle.odometer)} km`} />
        </ReadoutRow>
        <Divider className="my-3" />
        <ReadoutRow>
          <FieldReadout flex label="Owner" value={vehicle.customer} />
          <FieldReadout flex label="Colour" value={vehicle.color} />
        </ReadoutRow>
        <Divider className="my-3" />
        <FieldReadout label="VIN" value={vehicle.vin} />
        <View className="mt-3 flex-row items-center gap-2.5">
          <Caption>Warranty</Caption>
          <StatusPill status={vehicle.warrantyStatus === "Active" ? "Active" : vehicle.warrantyStatus} small />
          {vehicle.warrantyUntil ? <Caption>until {vehicle.warrantyUntil}</Caption> : null}
        </View>
      </Card>

      <SectionLabel right={<Caption>{history.length}</Caption>}>Service history</SectionLabel>
      <Card>
        {history.map((h, i) => (
          <View key={i} className={`flex-row items-center gap-2.5 py-[11px] ${i === 0 ? "" : "border-t border-border"}`}>
            <Readout size={12} className="w-[82px] text-muted-foreground">
              {h.date}
            </Readout>
            <Bold className="flex-1 text-[14px]">{h.label}</Bold>
            <StatusPill status={h.status} small />
          </View>
        ))}
      </Card>
    </>
  );
}
