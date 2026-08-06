import { supabase } from "@/shared/lib/supabase"

export async function setClinicActive(clinicId: string, isActive: boolean) {
  const { error } = await supabase
    .from("clinics")
    .update({ is_active: isActive })
    .eq("id", clinicId)
  if (error) throw error
}
