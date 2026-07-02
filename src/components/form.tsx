import { Pressable, Switch, TextInput, View } from "react-native";
import { useTheme } from "@/theme";
import { Bold, Caption, Readout } from "./text";
import { Icon, type IconName } from "./icon";

export function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <View className="mb-1.5 flex-row items-center justify-between">
      <View className="flex-row items-center gap-1">
        <Bold className="text-[13px]">{label}</Bold>
        {required ? <Bold className="text-[13px] text-primary">*</Bold> : null}
      </View>
      {hint ? <Caption>{hint}</Caption> : null}
    </View>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "characters" | "words";
  mono?: boolean;
}

export function TextField({ label, value, onChangeText, placeholder, required, multiline, keyboardType, autoCapitalize, mono }: TextFieldProps) {
  const { palette } = useTheme();
  return (
    <View>
      <FieldLabel label={label} required={required} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.mutedForeground}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        className={`rounded-md border border-border bg-card px-3.5 text-[15px] text-foreground ${mono ? "font-mono" : "font-sans"} ${
          multiline ? "min-h-[88px] py-3" : "h-[50px]"
        }`}
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
    </View>
  );
}

/** Read-only field that opens a Picker — shows the chosen label or a placeholder. */
export function SelectField({
  label,
  value,
  placeholder = "Select…",
  required,
  icon,
  onPress,
  onClear,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  icon?: IconName;
  onPress: () => void;
  onClear?: () => void;
}) {
  const { palette } = useTheme();
  return (
    <View>
      <FieldLabel label={label} required={required} />
      <Pressable
        onPress={onPress}
        className="h-[50px] flex-row items-center gap-2.5 rounded-md border border-border bg-card px-3.5 active:opacity-80"
      >
        {icon ? <Icon name={icon} size={18} color={palette.mutedForeground} /> : null}
        <Bold className={`flex-1 text-[15px] ${value ? "text-foreground" : "font-sans text-muted-foreground"}`} numberOfLines={1}>
          {value || placeholder}
        </Bold>
        {value && onClear ? (
          <Pressable onPress={onClear} hitSlop={10}>
            <Icon name="close-circle" size={18} color={palette.mutedForeground} />
          </Pressable>
        ) : (
          <Icon name="chevron-down" size={18} color={palette.mutedForeground} />
        )}
      </Pressable>
    </View>
  );
}

export function SwitchRow({ label, hint, value, onValueChange }: { label: string; hint?: string; value: boolean; onValueChange: (v: boolean) => void }) {
  const { palette } = useTheme();
  return (
    <View className="flex-row items-center justify-between rounded-md border border-border bg-card px-3.5 py-3">
      <View className="flex-1 pr-3">
        <Bold className="text-[14px]">{label}</Bold>
        {hint ? <Caption className="mt-0.5">{hint}</Caption> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: palette.primary, false: palette.border }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

/** Inline chip group — priority, fuel level, etc. */
export function ChipSelect<T extends string>({ label, options, value, onChange, required }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; required?: boolean }) {
  return (
    <View>
      <FieldLabel label={label} required={required} />
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              className={`rounded-full border px-3.5 py-2 ${active ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              <Caption className={active ? "font-sans-bold text-primary" : "text-muted-foreground"}>{opt || "—"}</Caption>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function QtyStepper({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) {
  const btn = (icon: "remove" | "add", delta: number) => (
    <Pressable
      onPress={() => onChange(Math.max(min, value + delta))}
      className="h-9 w-9 items-center justify-center rounded-sm border border-border bg-secondary active:opacity-80"
    >
      <Icon name={icon} size={18} />
    </Pressable>
  );
  return (
    <View className="flex-row items-center gap-2.5">
      {btn("remove", -1)}
      <Readout size={16} weight="semibold" className="min-w-[22px] text-center">
        {value}
      </Readout>
      {btn("add", 1)}
    </View>
  );
}
