import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type {
  Payment,
  TreatmentPlanBalance,
  TreatmentPlanWithItems,
} from "@/entities/treatments/model/types"

export function usePatientTreatmentPlans(patientId: string | undefined) {
  return useQuery({
    queryKey: ["treatment_plans", { patientId }],
    queryFn: async (): Promise<TreatmentPlanWithItems[]> => {
      const { data, error } = await supabase
        .from("treatment_plans")
        .select(
          "*, treatment_items(*), doctor:users!treatment_plans_doctor_id_fkey(id, full_name)"
        )
        .eq("patient_id", patientId!)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as unknown as TreatmentPlanWithItems[]
    },
    enabled: !!patientId,
  })
}

/** Empty for the `admin` role by RLS design — payments visibility is owner/admin only for financial data, but balances derive from treatment_plans which admin can also read. */
export function useTreatmentPlanBalances(patientId: string | undefined) {
  return useQuery({
    queryKey: ["treatment_plan_balances", { patientId }],
    queryFn: async (): Promise<TreatmentPlanBalance[]> => {
      const { data, error } = await supabase
        .from("treatment_plan_balances")
        .select("*")
        .eq("patient_id", patientId!)
      if (error) throw error
      return data
    },
    enabled: !!patientId,
  })
}

export function usePatientPayments(patientId: string | undefined) {
  return useQuery({
    queryKey: ["payments", { patientId }],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("patient_id", patientId!)
        .order("paid_at", { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!patientId,
  })
}
