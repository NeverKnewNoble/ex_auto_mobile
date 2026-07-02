import type { IconName } from "@/components";

export interface RowProps {
  icon: IconName;
  label: string;
  hint?: string;
  onPress?: () => void;
}
