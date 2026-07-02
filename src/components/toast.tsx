import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useTheme } from "@/theme";
import { Icon, type IconName } from "./icon";

type Tone = "success" | "error" | "info";
interface ToastMsg {
  id: number;
  text: string;
  tone: Tone;
}

interface ToastApi {
  show: (text: string, tone?: Tone) => void;
  success: (text: string) => void;
  error: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE: Record<Tone, { icon: IconName; accent: string }> = {
  success: { icon: "checkmark-circle", accent: "border-l-signal-go" },
  error: { icon: "alert-circle", accent: "border-l-signal-stop" },
  info: { icon: "information-circle", accent: "border-l-signal-info" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, tone: Tone = "info") => {
    if (timer.current) clearTimeout(timer.current);
    seq.current += 1;
    setToast({ id: seq.current, text, tone });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const api: ToastApi = {
    show,
    success: (t) => show(t, "success"),
    error: (t) => show(t, "error"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <View pointerEvents="none" className="absolute left-0 right-0 px-4" style={{ top: insets.top + 8 }}>
          <Animated.View
            key={toast.id}
            className={`flex-row items-center gap-2.5 rounded-lg border border-l-4 border-sidebar-border bg-sidebar px-4 py-3.5 ${TONE[toast.tone].accent}`}
            style={{ shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 10 }}
          >
            <Icon name={TONE[toast.tone].icon} size={20} color={palette.signal[toast.tone === "success" ? "go" : toast.tone === "error" ? "stop" : "info"]} />
            <Text className="flex-1 font-sans-bold text-[14px] text-sidebar-foreground">{toast.text}</Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
