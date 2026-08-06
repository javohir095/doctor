import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { Profile } from "@/entities/session/model/types"

export interface StaffWithClinic extends Profile {
  clinic: { id: string; name: string } | null
  branch: { id: string; name: string } | null
}

export function useAllStaff() {
  return useQuery({
    queryKey: ["clinics-admin", "all-staff"],
    queryFn: async (): Promise<StaffWithClinic[]> => {
      const { data, error } = await supabase
        .from("users")
        .select("*, clinic:clinics(id, name), branch:branches(id, name)")
        .neq("role", "superadmin")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as unknown as StaffWithClinic[]
    },
  })
}
