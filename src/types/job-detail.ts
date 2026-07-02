import type { IconName } from "@/components";
import type { JobCardDetail, RequestPartsItem } from "@/types/job-card";

export interface Line extends RequestPartsItem {
  item_name: string;
  rate: number;
}

export interface WorkflowBarProps {
  job: JobCardDetail;
  onChanged: () => void;
}

export interface OverviewTabProps {
  job: JobCardDetail;
}

export interface PartsTabProps {
  job: JobCardDetail;
}

export interface LaborTabProps {
  job: JobCardDetail;
  onChanged: () => void;
}

export interface TeamTabProps {
  job: JobCardDetail;
  onChanged: () => void;
}

export interface ChecklistTabProps {
  job: JobCardDetail;
  onChanged: () => void;
}

export interface TimeTabProps {
  job: JobCardDetail;
  onChanged: () => void;
}

export interface ReqsTabProps {
  job: JobCardDetail;
  onRequest: () => void;
}

export interface RequestPartsSheetProps {
  visible: boolean;
  jobName: string;
  onClose: () => void;
  onDone: () => void;
}

export interface TotalRowProps {
  label: string;
  value: string;
}

export interface LinkLineProps {
  icon: IconName;
  label: string;
}
