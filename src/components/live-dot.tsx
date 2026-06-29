import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

/**
 * The `.live-dot` signature — a 1.6s scanline shimmer on "live" / in-progress
 * badges (e.g. a job with a running time log). Pulses opacity + a soft halo.
 */
export function LiveDot({ size = 8, color }: { size?: number; color?: string }) {
  const { palette } = useTheme();
  const tone = color ?? palette.signal.stop;
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const halo = useAnimatedStyle(() => ({
    opacity: 0.55 - pulse.value * 0.45,
    transform: [{ scale: 1 + pulse.value * 1.6 }],
  }));

  const core = useAnimatedStyle(() => ({ opacity: 0.7 + pulse.value * 0.3 }));

  return (
    <Animated.View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          { position: "absolute", width: size, height: size, borderRadius: size, backgroundColor: tone },
          halo,
        ]}
      />
      <Animated.View
        style={[{ width: size, height: size, borderRadius: size, backgroundColor: tone }, core]}
      />
    </Animated.View>
  );
}
