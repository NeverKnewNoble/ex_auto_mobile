import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Bold, Button, Caption, Display, Eyebrow, GarageGrid, Icon, Small } from "@/components";
import { BRANCH } from "@/data/mock";
import { useTheme } from "@/theme";
import type { IconName } from "@/components";

const FEATURES: { icon: IconName; title: string; detail: string }[] = [
  { icon: "scan-circle-outline", title: "Inspections", detail: "Walk-around, QC, pre-delivery — camera-led." },
  { icon: "construct-outline", title: "Job cards", detail: "Live checklist, time logs, parts, delivery sign-off." },
  { icon: "cube-outline", title: "Parts", detail: "Requisition from the floor, track every request." },
];

export default function Landing() {
  const router = useRouter();
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <GarageGrid />

      <View
        className="flex-1 px-6"
        style={{ paddingTop: insets.top + 40, paddingBottom: insets.top }}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Eyebrow>Garage Console · Field Companion</Eyebrow>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(650).springify().damping(18)} className="mt-3 flex-row items-end">
          <Display size={72}>EX</Display>
          <Display size={72} className="text-primary">
            AUTO
          </Display>
        </Animated.View>

        <Small className="mt-4 text-[15px] leading-[22px]">
          The shop-floor half of ExAuto. Sign in to pick up today’s jobs, run inspections, and request parts — right at
          the vehicle.
        </Small>

        {/* Feature list */}
        <View className="mt-8 gap-[18px]">
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.title}
              entering={FadeInUp.delay(200 + i * 90).duration(500)}
              className="flex-row items-center gap-3.5"
            >
              <View className="h-[46px] w-[46px] items-center justify-center rounded-md border border-primary/25 bg-primary/10">
                <Icon name={f.icon} size={22} color={palette.primary} />
              </View>
              <View className="flex-1">
                <Bold className="text-[15.5px]">{f.title}</Bold>
                <Caption className="mt-px">{f.detail}</Caption>
              </View>
            </Animated.View>
          ))}
        </View>

        <View className="flex-1" />

        {/* Auth options */}
        <Animated.View entering={FadeIn.delay(450).duration(500)} className="gap-3">
          <Button label="Log in" icon="log-in-outline" block onPress={() => router.push("/pages/auth/login")} />
          <Button label="Browse as guest" variant="ghost" block onPress={() => router.replace("/pages/today")} />
          <View className="mt-1 flex-row items-center justify-center gap-1.5">
            <Icon name="business-outline" size={13} color={palette.mutedForeground} />
            <Caption>{BRANCH}</Caption>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
