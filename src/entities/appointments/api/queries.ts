import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { AppointmentWithRelations } from "@/entities/appointments/model/types"

const RELATIONS_SELECT =
  "*, patient:patients(id, full_name, phone), doctor:users!appointments_doctor_id_fkey(id, full_name)"

export function usePatientAppointments(patientId: string | undefined) {
  return useQuery({
    queryKey: ["appointments", { patientId }],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select(RELATIONS_SELECT)
        .eq("patient_id", patientId!)
        .order("scheduled_at", { ascending: false })
      if (error) throw error
      return data as unknown as AppointmentWithRelations[]
    },
    enabled: !!patientId,
  })
}

export function useAppointmentsInRange(
  startIso: string,
  endIso: string,
  doctorId?: string
) {
  return useQuery({
    queryKey: ["appointments", { startIso, endIso, doctorId }],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      let query = supabase
        .from("appointments")
        .select(RELATIONS_SELECT)
        .gte("scheduled_at", startIso)
        .lt("scheduled_at", endIso)
        .order("scheduled_at", { ascending: true })

      if (doctorId) query = query.eq("doctor_id", doctorId)

      const { data, error } = await query
      if (error) throw error
      return data as unknown as AppointmentWithRelations[]
    },
  })
}

export function useTodayAppointmentsCount(doctorId?: string) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return useAppointmentsInRange(start.toISOString(), end.toISOString(), doctorId)
}
