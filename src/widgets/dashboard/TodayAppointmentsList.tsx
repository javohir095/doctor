import { format } from "date-fns"
import { Link } from "react-router-dom"
import { CalendarX2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/shared/ui/EmptyState"
import { useTodayAppointmentsCount } from "@/entities/appointments/api/queries"
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_LABELS,
} from "@/entities/appointments/model/types"

export function TodayAppointmentsList({
  doctorId,
  title = "Bugungi qabullar",
}: {
  doctorId?: string
  title?: string
}) {
  const { data: appointments, isLoading } = useTodayAppointmentsCount(doctorId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        ) : !appointments || appointments.length === 0 ? (
          <EmptyState icon={CalendarX2} title="Bugun navbat yo'q" />
        ) : (
          appointments.map((a) => (
            <Link
              key={a.id}
              to={`/patients/${a.patient_id}`}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-sm text-muted-foreground shrink-0">
                  {format(new Date(a.scheduled_at), "HH:mm")}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.patient?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.doctor?.full_name} · {a.service_name ?? "Xizmat yo'q"}
                  </p>
                </div>
              </div>
              <Badge variant={APPOINTMENT_STATUS_BADGE[a.status]} className="shrink-0">
                {APPOINTMENT_STATUS_LABELS[a.status]}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
