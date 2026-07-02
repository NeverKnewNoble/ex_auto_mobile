import type { JobCardListRow, JobCardStatus } from "@/types/job-card";

export type Filter = "All" | JobCardStatus;

export interface JobRowProps {
  row: JobCardListRow;
  onPress: () => void;
}
