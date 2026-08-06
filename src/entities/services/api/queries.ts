import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { Tables } from "@/shared/types/database"

export type ClinicService = Tables<"clinic_services">

export function useServices(activeOnly = false) {
  return useQuery({
    queryKey: ["clinic_services", { activeOnly }],
    queryFn: async (): Promise<ClinicService[]> => {
      let query = supabase.from("clinic_services").select("*").order("name")
      if (activeOnly) query = query.eq("is_active", true)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
