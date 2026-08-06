import type { Tables } from "@/shared/types/database"

export type Appointment = Tables<"appointments">

export type AppointmentStatus = Appointment["status"]

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Rejalashtirilgan",
  confirmed: "Tasdiqlangan",
  no_show: "Kelmadi",
  completed: "Yakunlandi",
  cancelled: "Bekor qilindi",
}

export const APPOINTMENT_STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  scheduled: "outline",
  confirmed: "default",
  no_show: "destructive",
  completed: "secondary",
  cancelled: "destructive",
}

export interface AppointmentWithRelations extends Appointment {
  patient: { id: string; full_name: string; phone: string } | null
  doctor: { id: string; full_name: string } | null
}
