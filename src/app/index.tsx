import { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { GarageGrid } from "@/components/garage-grid";
import { LiveDot } from "@/components/live-dot";
import { BRANCH } from "@/data/mock";
import { fontAssets } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Splash() {
  const router = useRouter();
  const [fontsLoaded] = useFonts(fontAssets);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!fontsLoaded) return;
    sweep.value = withDelay(280, withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.cubic) }));
    const id = setTimeout(() => router.replace("/pages/auth/landing"), 2050);
    return () => clearTimeout(id);
  }, [fontsLoaded, router, sweep]);

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  const ignition = useAnimatedStyle(() => ({ width: `${sweep.value * 100}%` }));

  // The launch gate is intentionally always asphalt — ignition, not theme.
  if (!fontsLoaded) return <View className="flex-1 bg-[#0B0C0F]" onLayout={onLayout} />;

  return (
    <View className="flex-1 justify-center bg-[#0B0C0F]" onLayout={onLayout}>
      <GarageGrid />

      <View className="px-9">
        <Animated.View entering={FadeIn.duration(500)}>
          <Text className="font-mono-semibold text-[11px] tracking-[3px] text-[#9395A0]">
            GARAGE CONSOLE · FIELD COMPANION
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(650).springify().damping(18)} className="mt-3.5">
          <Text
            className="font-display text-[96px] text-[#F0EFEA]"
            style={{ lineHeight: 92, includeFontPadding: false }}
          >
            EX
          </Text>
          <Text
            className="font-display text-[96px] text-[#FF3F4C]"
            style={{ lineHeight: 96, includeFontPadding: false }}
          >
            AUTO
          </Text>
        </Animated.View>

        {/* Ignition sweep — the one motion that earns the screen. */}
        <View className="mt-6 h-[3px] overflow-hidden rounded-[2px] bg-white/10">
          <Animated.View style={ignition} className="h-[3px] rounded-[2px] bg-[#FF3F4C]" />
        </View>

        <Animated.Text
          entering={FadeIn.delay(400).duration(600)}
          className="mt-3.5 font-sans text-[13.5px] leading-[20px] text-[#9395A0]"
        >
          The shop-floor half of ExAuto — inspections, job cards, and parts, on the vehicle.
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeIn.delay(700).duration(600)}
        className="absolute left-9 right-9 bottom-[54px] flex-row items-center gap-2"
      >
        <LiveDot size={7} color="#46C266" />
        <Text className="font-mono text-[11.5px] tracking-[0.4px] text-[#9395A0]">v1.0 · {BRANCH.toUpperCase()}</Text>
      </Animated.View>
    </View>
  );
}
