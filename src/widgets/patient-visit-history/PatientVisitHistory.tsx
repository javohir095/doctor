import { useState } from "react"
import { format } from "date-fns"
import { History } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/shared/ui/EmptyState"
import { usePatientAppointments } from "@/entities/appointments/api/queries"
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentWithRelations,
} from "@/entities/appointments/model/types"
import { AppointmentDetailSheet } from "@/widgets/appointment-calendar/AppointmentDetailSheet"

export function PatientVisitHistory({ patientId }: { patientId: string }) {
  const { data: appointments, isLoading } = usePatientAppointments(patientId)
  const [selected, setSelected] = useState<AppointmentWithRelations | null>(null)

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
        <button
          key={appt.id}
          type="button"
          onClick={() => setSelected(appt)}
          className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent hover:border-primary/30"
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
          <Badge variant={APPOINTMENT_STATUS_BADGE[appt.status]} className="shrink-0">
            {APPOINTMENT_STATUS_LABELS[appt.status]}
          </Badge>
        </button>
      ))}

      <AppointmentDetailSheet
        appointment={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
