import type { Tables } from "@/shared/types/database"

export type TreatmentPlan = Tables<"treatment_plans">
export type TreatmentItem = Tables<"treatment_items">
export type Payment = Tables<"payments">
export type TreatmentPlanBalance = Tables<"treatment_plan_balances">

export interface TreatmentPlanWithItems extends TreatmentPlan {
  treatment_items: TreatmentItem[]
  doctor: { id: string; full_name: string } | null
}

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  cash: "Naqd",
  uzcard: "UzCard",
  humo: "Humo",
  click: "Click",
  payme: "Payme",
}

export const TREATMENT_PLAN_STATUS_LABELS: Record<string, string> = {
  active: "Faol",
  completed: "Yakunlandi",
  cancelled: "Bekor qilindi",
}
