import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert, TablesUpdate } from "@/shared/types/database"

export async function createBranch(input: TablesInsert<"branches">) {
  const { error } = await supabase.from("branches").insert(input)
  if (error) throw error
}

export async function updateBranch(id: string, input: TablesUpdate<"branches">) {
  const { error } = await supabase.from("branches").update(input).eq("id", id)
  if (error) throw error
}

export async function deleteBranch(id: string) {
  const { error } = await supabase.from("branches").delete().eq("id", id)
  if (error) throw error
}
