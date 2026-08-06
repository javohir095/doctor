import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert } from "@/shared/types/database"

export async function createRecall(input: TablesInsert<"recall_schedule">) {
  const { error } = await supabase.from("recall_schedule").insert(input)
  if (error) throw error
}
