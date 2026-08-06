import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { Clinic } from "@/entities/session/model/types"

export interface ClinicWithCounts extends Clinic {
  staffCount: number
  branchCount: number
}

export function useAllClinics() {
  return useQuery({
    queryKey: ["clinics-admin", "all"],
    queryFn: async (): Promise<ClinicWithCounts[]> => {
      const { data: clinics, error } = await supabase
        .from("clinics")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error

      const { data: staff, error: staffError } = await supabase
        .from("users")
        .select("clinic_id")
        .not("clinic_id", "is", null)
      if (staffError) throw staffError

      const { data: branches, error: branchesError } = await supabase
        .from("branches")
        .select("clinic_id")
      if (branchesError) throw branchesError

      return clinics.map((clinic) => ({
        ...clinic,
        staffCount: staff.filter((s) => s.clinic_id === clinic.id).length,
        branchCount: branches.filter((b) => b.clinic_id === clinic.id).length,
      }))
    },
  })
}
