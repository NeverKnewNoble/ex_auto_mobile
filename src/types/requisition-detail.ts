import type { RequisitionDetail, RequisitionItem } from "@/types/requisition";

export interface ActionButtonsProps {
  req: RequisitionDetail;
  act: (fn: () => Promise<unknown>, s: string) => void;
  busy: boolean;
}

export interface ItemRowProps {
  item: RequisitionItem;
}

export interface ReadyTileProps {
  value: number;
  label: string;
  toneText: string;
}
