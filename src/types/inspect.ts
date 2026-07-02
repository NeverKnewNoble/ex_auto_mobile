import type { InspectionListRow, InspectionStatus } from "@/types/inspection";

export type Filter = "All" | InspectionStatus;

export interface InspectionRowProps {
  row: InspectionListRow;
  onPress: () => void;
}
