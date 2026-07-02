import { useState } from "react";
import { TextInput, View } from "react-native";
import {
  AppHeader,
  Button,
  Caption,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Readout,
  Screen,
  SectionLabel,
  Skeleton,
  Small,
} from "@/components";
import { useFetch } from "@/hooks/use-fetch";
import { searchVehicles } from "@/services";
import { num } from "@/lib/format";
import { useTheme } from "@/theme";

export default function Lookup() {
  const { palette } = useTheme();
  const [query, setQuery] = useState("");
  const q = query.trim();

  const { data: results, loading, error, refresh } = useFetch(
    () => (q ? searchVehicles(q) : Promise.resolve([])),
    [q]
  );

  return (
    <Screen>
      <AppHeader back eyebrow="Read-only · at the car" title="Lookup" />

      {/* Search field */}
      <View className="h-[50px] flex-row items-center gap-2 rounded-md border border-border bg-card px-3">
        <Icon name="search" size={20} color={palette.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Plate or model"
          placeholderTextColor={palette.mutedForeground}
          autoCapitalize="characters"
          className="flex-1 font-sans text-[15px] text-foreground"
        />
      </View>
      <Button label="Scan plate" icon="scan" variant="secondary" block onPress={() => setQuery("GR")} />

      {!q ? (
        <EmptyState icon="car-outline" title="Search a vehicle" hint="By plate or model to pull its record." />
      ) : loading ? (
        <View className="gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} compact>
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-2 h-3 w-44" />
            </Card>
          ))}
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : !Array.isArray(results) || results.length === 0 ? (
        <EmptyState icon="car-outline" title="No vehicle matches" hint={`Nothing for “${query}”.`} />
      ) : (
        <>
          <SectionLabel right={<Caption>{results.length}</Caption>}>Matches</SectionLabel>
          {results.map((v) => (
            <Card key={v.value} compact>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Readout size={15} weight="semibold">
                    {v.meta?.license_plate ?? v.sublabel ?? v.value}
                  </Readout>
                  <Small className="mt-0.5">{v.label}</Small>
                </View>
                {v.meta?.odometer_reading != null ? (
                  <View className="items-end">
                    <Readout size={13} className="text-muted-foreground">
                      {num(v.meta.odometer_reading)} km
                    </Readout>
                    <Caption>odometer</Caption>
                  </View>
                ) : null}
              </View>
            </Card>
          ))}
          <Caption className="px-1">Full history & warranty need a vehicle-detail endpoint.</Caption>
        </>
      )}
    </Screen>
  );
}
