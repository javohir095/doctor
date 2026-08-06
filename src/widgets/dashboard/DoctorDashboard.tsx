import { CalendarCheck, UserCheck } from "lucide-react"
import { StatTile } from "@/shared/ui/StatTile"
import { useTodayAppointmentsCount } from "@/entities/appointments/api/queries"
import { TodayAppointmentsList } from "./TodayAppointmentsList"

export function DoctorDashboard({ doctorId }: { doctorId: string }) {
  const { data: appointments } = useTodayAppointmentsCount(doctorId)
  const completedToday =
    appointments?.filter((a) => a.status === "completed").length ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile
          label="Bugungi qabullarim"
          value={String(appointments?.length ?? 0)}
          icon={CalendarCheck}
        />
        <StatTile
          label="Yakunlangan"
          value={String(completedToday)}
          icon={UserCheck}
          tone="success"
        />
      </div>

      <TodayAppointmentsList doctorId={doctorId} title="Bugungi bemorlarim" />
    </div>
  )
}
