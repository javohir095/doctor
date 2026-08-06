import type { Tables } from "@/shared/types/database"

export type Recall = Tables<"recall_schedule">

export const RECALL_STATUS_LABELS: Record<string, string> = {
  pending: "Kutilmoqda",
  sent: "Eslatma yuborildi",
  completed: "Bajarildi",
  cancelled: "Bekor qilindi",
}
