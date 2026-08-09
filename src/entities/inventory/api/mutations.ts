import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert } from "@/shared/types/database"

export async function createInventoryItem(input: TablesInsert<"inventory_items">) {
  const { data, error } = await supabase.from("inventory_items").insert(input).select("id").single()
  if (error) throw error
  return data
}

export async function addInventoryTransaction(input: TablesInsert<"inventory_transactions">) {
  const { error } = await supabase.from("inventory_transactions").insert(input)
  if (error) throw error
}
