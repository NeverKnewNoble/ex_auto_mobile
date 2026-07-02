import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppHeader, Bold, Button, Caption, Display, Eyebrow, GarageGrid, Icon, Small } from "@/components";
import { useAction } from "@/hooks/use-action";
import { useSession } from "@/hooks/use-session";
import { setApiBase } from "@/services";
import { useTheme } from "@/theme";
import type { FieldProps } from "@/types/login";

export default function Login() {
  const router = useRouter();
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const { run, busy } = useAction();

  const [site, setSite] = useState("");
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const canSubmit = site.trim().length > 0 && usr.trim().length > 0 && pwd.length > 0;

  const submit = () =>
    run(
      async () => {
        await setApiBase(site);
        return signIn({ usr, pwd });
      },
      {
        success: "Signed in",
        onDone: () => router.replace("/pages/dashboard"),
      }
    );

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
          <Small className="mt-2">Use your workshop email or username and password.</Small>

          <View className="mt-7 gap-4">
            <Field
              label="Site URL"
              icon="globe-outline"
              value={site}
              onChangeText={setSite}
              placeholder="example.erpxpand.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Field
              label="Email or username"
              icon="person-outline"
              value={usr}
              onChangeText={setUsr}
              placeholder="you@workshop.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Field
              label="Password"
              icon="lock-closed-outline"
              value={pwd}
              onChangeText={setPwd}
              placeholder="••••••••"
              secure={!showPwd}
              autoCapitalize="none"
              trailing={
                <Pressable onPress={() => setShowPwd((s) => !s)} hitSlop={10}>
                  <Icon name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color={palette.mutedForeground} />
                </Pressable>
              }
            />

            <Pressable onPress={() => {}} className="self-end" hitSlop={8}>
              <Caption className="text-accent">Forgot password?</Caption>
            </Pressable>
          </View>

          <View className="flex-1" />

          <View className="gap-3" style={{ paddingBottom: insets.top + 12 }}>
            <Button label="Sign in" icon="arrow-forward" block loading={busy} disabled={!canSubmit} onPress={submit} />
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
}: FieldProps) {
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
