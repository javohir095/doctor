import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { Patient, PatientMedicalNotes } from "@/entities/patients/model/types"

export function usePatients(search: string) {
  return useQuery({
    queryKey: ["patients", { search }],
    queryFn: async (): Promise<Patient[]> => {
      let query = supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)

      if (search.trim()) {
        const term = search.trim()
        query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function usePatient(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: async (): Promise<Patient> => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!patientId,
  })
}

/** May legitimately return null: an admin's RLS grant excludes this table entirely. */
export function usePatientMedicalNotes(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient_medical_notes", patientId],
    queryFn: async (): Promise<PatientMedicalNotes | null> => {
      const { data, error } = await supabase
        .from("patient_medical_notes")
        .select("*")
        .eq("patient_id", patientId!)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!patientId,
  })
}
