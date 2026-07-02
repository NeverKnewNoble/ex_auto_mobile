import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Card } from "./card";

/** A single pulsing placeholder block. Size it with className (h-/w-/rounded-). */
export function Skeleton({ className }: { className?: string }) {
  const o = useSharedValue(0.4);
  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View className={`rounded-md bg-foreground/10 ${className ?? ""}`} style={style} />;
}

// ── shared building blocks ──

/** Row of N equal stat/KPI tiles. */
function TileRow({ count = 4, lines = 2 }: { count?: number; lines?: number }) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} compact className="flex-1">
          <Skeleton className="h-6 w-10" />
          {lines > 1 ? <Skeleton className="mt-2 h-3 w-12" /> : null}
        </Card>
      ))}
    </View>
  );
}

/** A list card placeholder (id + pill, title, sub, footer). */
function ListCardSkel() {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </View>
      <Skeleton className="mt-3 h-5 w-44" />
      <Skeleton className="mt-2 h-3 w-28" />
      <View className="mt-3 flex-row items-center gap-3 border-t border-border pt-3">
        <Skeleton className="h-3 w-20" />
        <View className="flex-1" />
        <Skeleton className="h-3 w-16" />
      </View>
    </Card>
  );
}

function CompactRowSkel() {
  return (
    <Card compact>
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-5 w-12" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </View>
        <Skeleton className="h-5 w-14 rounded-full" />
      </View>
    </Card>
  );
}

function CardBlockSkel({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`${i === 0 ? "mt-3" : "mt-2"} h-4`} />
      ))}
    </Card>
  );
}

function ChipsSkel() {
  return (
    <View className="flex-row gap-2">
      {[70, 96, 84, 110, 72].map((w, i) => (
        <View key={i} style={{ width: w }}>
          <Skeleton className="h-8 rounded-full" />
        </View>
      ))}
    </View>
  );
}

// ── list-page skeletons ──

export function DashboardSkeleton() {
  return (
    <>
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="w-[48.5%]">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-12" />
          </Card>
        ))}
      </View>
      <Skeleton className="mt-2 h-3 w-24" />
      {Array.from({ length: 3 }).map((_, i) => (
        <ListCardSkel key={i} />
      ))}
      <Skeleton className="mt-2 h-3 w-24" />
      {Array.from({ length: 2 }).map((_, i) => (
        <CompactRowSkel key={i} />
      ))}
    </>
  );
}

export function TodaySkeleton() {
  return (
    <>
      <TileRow count={4} />
      <Skeleton className="mt-2 h-3 w-20" />
      {Array.from({ length: 4 }).map((_, i) => (
        <ListCardSkel key={i} />
      ))}
    </>
  );
}

export function JobsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <ListCardSkel key={i} />
      ))}
    </>
  );
}

export function PartsSkeleton() {
  return (
    <>
      <TileRow count={4} />
      <ChipsSkel />
      {Array.from({ length: 4 }).map((_, i) => (
        <ListCardSkel key={i} />
      ))}
    </>
  );
}

export function InspectSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <ListCardSkel key={i} />
      ))}
    </>
  );
}

// ── detail-page skeletons ──

function StatusLineSkel() {
  return (
    <View className="flex-row items-center gap-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </View>
  );
}

export function JobDetailSkeleton() {
  return (
    <>
      <StatusLineSkel />
      <Skeleton className="h-12 w-full rounded-md" />
      <ChipsSkel />
      <CardBlockSkel lines={3} />
      <CardBlockSkel lines={4} />
    </>
  );
}

export function RequisitionDetailSkeleton() {
  return (
    <>
      <StatusLineSkel />
      <TileRow count={4} />
      <Skeleton className="h-12 w-full rounded-md" />
      {Array.from({ length: 3 }).map((_, i) => (
        <CardBlockSkel key={i} lines={2} />
      ))}
    </>
  );
}

export function InspectionDetailSkeleton() {
  return (
    <>
      <StatusLineSkel />
      <CardBlockSkel lines={2} />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} compact>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-11 w-full rounded-md" />
        </Card>
      ))}
    </>
  );
}

export function AppointmentDetailSkeleton() {
  return (
    <>
      <StatusLineSkel />
      <CardBlockSkel lines={3} />
      <CardBlockSkel lines={2} />
    </>
  );
}
