import type { IconName } from "@/components";

export interface RowProps {
  icon: IconName;
  label: string;
  hint?: string;
  /** Unread-style count pill on the right (hidden when 0/undefined). */
  badge?: number;
  onPress?: () => void;
}
