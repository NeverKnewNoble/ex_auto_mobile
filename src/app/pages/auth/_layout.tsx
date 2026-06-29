import { Stack } from "expo-router";

/** Pre-app gate — landing → login. No tab bar (hidden in pages/_layout). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
