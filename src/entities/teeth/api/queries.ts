import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { ToothRecordWithRelations } from "@/entities/teeth/model/types"

export function usePatientToothRecords(patientId: string | undefined) {
  return useQuery({
    queryKey: ["tooth_records", { patientId }],
    queryFn: async (): Promise<ToothRecordWithRelations[]> => {
      const { data, error } = await supabase
        .from("tooth_records")
        .select(
          "*, doctor:users!tooth_records_doctor_id_fkey(id, full_name), service:clinic_services(id, name)"
        )
        .eq("patient_id", patientId!)
        .order("record_date", { ascending: false })
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as unknown as ToothRecordWithRelations[]
    },
    enabled: !!patientId,
  })
}
