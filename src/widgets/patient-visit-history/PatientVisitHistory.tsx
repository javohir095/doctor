import { format } from "date-fns"
import { History } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/shared/ui/EmptyState"
import { usePatientAppointments } from "@/entities/appointments/api/queries"
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_LABELS,
} from "@/entities/appointments/model/types"

export function PatientVisitHistory({ patientId }: { patientId: string }) {
  const { data: appointments, isLoading } = usePatientAppointments(patientId)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (!appointments || appointments.length === 0) {
    return <EmptyState icon={History} title="Hozircha tashriflar yo'q" />
  }

  return (
    <div className="space-y-3">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border bg-card p-4"
        >
          <div>
            <p className="font-medium">
              {format(new Date(appt.scheduled_at), "dd.MM.yyyy HH:mm")}
            </p>
            <p className="text-sm text-muted-foreground">
              {appt.doctor?.full_name ?? "—"} ·{" "}
              {appt.service_name ?? "Xizmat ko'rsatilmagan"}
            </p>
            {appt.notes && (
              <p className="text-sm text-muted-foreground mt-1">{appt.notes}</p>
            )}
          </div>
          <Badge variant={APPOINTMENT_STATUS_BADGE[appt.status]}>
            {APPOINTMENT_STATUS_LABELS[appt.status]}
          </Badge>
        </div>
      ))}
    </div>
  )
}
