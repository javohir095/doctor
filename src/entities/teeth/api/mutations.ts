import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert } from "@/shared/types/database"

export async function createToothRecord(input: TablesInsert<"tooth_records">) {
  const { error } = await supabase.from("tooth_records").insert(input)
  if (error) throw error
}
