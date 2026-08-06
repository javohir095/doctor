import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert, TablesUpdate } from "@/shared/types/database"

export async function createAppointment(input: TablesInsert<"appointments">) {
  const { data, error } = await supabase
    .from("appointments")
    .insert(input)
    .select("id")
    .single()
  if (error) throw error
  return data
}

export async function updateAppointment(
  id: string,
  input: TablesUpdate<"appointments">
) {
  const { error } = await supabase.from("appointments").update(input).eq("id", id)
  if (error) throw error
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from("appointments").delete().eq("id", id)
  if (error) throw error
}
