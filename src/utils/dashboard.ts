import { useRouter } from "expo-router";
import type { AttentionItem } from "@/types/dashboard";

export function routeAttention(router: ReturnType<typeof useRouter>, it: AttentionItem) {
  const ref = it.ref ?? it.name;
  if (it.kind === "job") router.push({ pathname: "/pages/job-detail", params: { id: ref } });
  else if (it.kind === "requisition") router.push({ pathname: "/pages/requisition-detail", params: { name: ref } });
  else if (it.kind === "inspection") router.push({ pathname: "/pages/inspection-detail", params: { name: ref } });
  else router.push({ pathname: "/pages/appointment-detail", params: { id: ref } });
}
