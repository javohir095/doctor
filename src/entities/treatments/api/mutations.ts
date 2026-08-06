import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert } from "@/shared/types/database"

export async function createTreatmentPlan(
  plan: TablesInsert<"treatment_plans">,
  items: Omit<TablesInsert<"treatment_items">, "treatment_plan_id" | "clinic_id">[]
) {
  const { data: createdPlan, error: planError } = await supabase
    .from("treatment_plans")
    .insert(plan)
    .select("id")
    .single()
  if (planError) throw planError

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("treatment_items").insert(
      items.map((item) => ({
        ...item,
        treatment_plan_id: createdPlan.id,
        clinic_id: plan.clinic_id,
      }))
    )
    if (itemsError) throw itemsError
  }

  return createdPlan
}

export async function addTreatmentItem(input: TablesInsert<"treatment_items">) {
  const { error } = await supabase.from("treatment_items").insert(input)
  if (error) throw error
}

export async function deleteTreatmentItem(id: string) {
  const { error } = await supabase.from("treatment_items").delete().eq("id", id)
  if (error) throw error
}

export async function recordPayment(input: TablesInsert<"payments">) {
  const { error } = await supabase.from("payments").insert(input)
  if (error) throw error
}
