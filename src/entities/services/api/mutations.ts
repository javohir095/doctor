import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert, TablesUpdate } from "@/shared/types/database"

export async function createService(input: TablesInsert<"clinic_services">) {
  const { error } = await supabase.from("clinic_services").insert(input)
  if (error) throw error
}

export async function updateService(
  id: string,
  input: TablesUpdate<"clinic_services">
) {
  const { error } = await supabase
    .from("clinic_services")
    .update(input)
    .eq("id", id)
  if (error) throw error
}

export async function deleteService(id: string) {
  const { error } = await supabase.from("clinic_services").delete().eq("id", id)
  if (error) throw error
}
