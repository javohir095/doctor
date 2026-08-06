import { supabase } from "@/shared/lib/supabase"

export async function setStaffActive(userId: string, isActive: boolean) {
  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", userId)
  if (error) throw error
}
