import type { TextInput } from "react-native";
import type { IconName } from "@/components";

export type FieldProps = {
  label: string;
  icon: IconName;
  trailing?: React.ReactNode;
  mono?: boolean;
  secure?: boolean;
} & React.ComponentProps<typeof TextInput>;
