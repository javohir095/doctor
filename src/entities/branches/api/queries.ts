import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { Branch } from "@/entities/branches/model/types"

export function useBranches(clinicId: string | undefined) {
  return useQuery({
    queryKey: ["branches", { clinicId }],
    queryFn: async (): Promise<Branch[]> => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("clinic_id", clinicId!)
        .order("created_at")
      if (error) throw error
      return data
    },
    enabled: !!clinicId,
  })
}
