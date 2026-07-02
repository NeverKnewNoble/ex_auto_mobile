import type { RequisitionListRow } from "@/types/requisition";

export interface SummaryTileProps {
  value: number;
  label: string;
  toneText?: string;
}

export interface FilterChipProps {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}

export interface SearchRowProps {
  value: string;
  onChangeText: (t: string) => void;
}

export interface RequisitionCardProps {
  row: RequisitionListRow;
  onPress: () => void;
}
