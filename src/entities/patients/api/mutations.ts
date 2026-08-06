import { supabase } from "@/shared/lib/supabase"
import type { TablesInsert, TablesUpdate } from "@/shared/types/database"

export async function createPatient(input: TablesInsert<"patients">) {
  const { data, error } = await supabase
    .from("patients")
    .insert(input)
    .select("id")
    .single()
  if (error) throw error
  return data
}

export async function updatePatient(
  id: string,
  input: TablesUpdate<"patients">
) {
  const { error } = await supabase.from("patients").update(input).eq("id", id)
  if (error) throw error
}

export async function upsertMedicalNotes(input: {
  patient_id: string
  clinic_id: string
  notes: string
  updated_by: string
}) {
  const { error } = await supabase
    .from("patient_medical_notes")
    .upsert(input, { onConflict: "patient_id" })
  if (error) throw error
}

export async function logPatientAccess(input: {
  clinic_id: string
  user_id: string
  patient_id: string
}) {
  // Fire-and-forget audit trail (TZ 9-bo'lim). Failure here should never
  // block the user from viewing the record.
  await supabase.from("access_log").insert({ ...input, action: "view_patient" })
}
