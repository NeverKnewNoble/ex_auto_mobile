import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppHeader, Bold, Button, Caption, Display, Eyebrow, GarageGrid, Icon, Small } from "@/components";
import { BRANCH } from "@/data/mock";
import { useTheme } from "@/theme";
import type { IconName } from "@/components";

export default function Login() {
  const router = useRouter();
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const canSubmit = employeeId.trim().length > 0 && pin.length >= 4;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <GarageGrid />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ paddingTop: insets.top }}>
          <AppHeader back title="Log in" />
        </View>

        <View className="flex-1 px-6 pt-2">
          <Eyebrow>Welcome back to EX Auto</Eyebrow>
          <Display size={30} className="mt-1">
            Sign in to your bay
          </Display>
          <Small className="mt-2">Use your workshop employee ID and 4-digit PIN.</Small>

          <View className="mt-7 gap-4">
            <Field
              label="Employee ID"
              icon="id-card-outline"
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="e.g. TECH-014"
              autoCapitalize="characters"
              mono
            />
            <Field
              label="PIN"
              icon="lock-closed-outline"
              value={pin}
              onChangeText={setPin}
              placeholder="••••"
              secure={!showPin}
              keyboardType="number-pad"
              maxLength={6}
              mono
              trailing={
                <Pressable onPress={() => setShowPin((s) => !s)} hitSlop={10}>
                  <Icon name={showPin ? "eye-off-outline" : "eye-outline"} size={20} color={palette.mutedForeground} />
                </Pressable>
              }
            />

            <Pressable onPress={() => {}} className="self-end" hitSlop={8}>
              <Caption className="text-accent">Forgot PIN?</Caption>
            </Pressable>
          </View>

          <View className="flex-1" />

          <View className="gap-3" style={{ paddingBottom: insets.top + 12 }}>
            <Button
              label="Sign in"
              icon="arrow-forward"
              block
              disabled={!canSubmit}
              onPress={() => router.replace("/pages/today")}
            />
            <View className="flex-row items-center justify-center gap-1.5">
              <Icon name="business-outline" size={13} color={palette.mutedForeground} />
              <Caption>{BRANCH}</Caption>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  icon,
  trailing,
  mono,
  secure,
  ...input
}: {
  label: string;
  icon: IconName;
  trailing?: React.ReactNode;
  mono?: boolean;
  secure?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  const { palette } = useTheme();
  return (
    <View className="gap-[7px]">
      <Bold className="text-[13px]">{label}</Bold>
      <View className="h-[52px] flex-row items-center gap-2.5 rounded-md border border-border bg-card px-3.5">
        <Icon name={icon} size={19} color={palette.mutedForeground} />
        <TextInput
          {...input}
          secureTextEntry={secure}
          placeholderTextColor={palette.mutedForeground}
          className={`flex-1 text-[15.5px] text-foreground ${mono ? "font-mono tracking-[1px]" : "font-sans"}`}
        />
        {trailing}
      </View>
    </View>
  );
}
