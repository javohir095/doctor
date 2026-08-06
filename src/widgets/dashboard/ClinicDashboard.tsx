import { CalendarCheck, CircleX, Users2, Wallet } from "lucide-react"
import { StatTile } from "@/shared/ui/StatTile"
import { useTodayAppointmentsCount } from "@/entities/appointments/api/queries"
import {
  useActivePatientsCount,
  useTodayRevenue,
  useUpcomingRecallsCount,
} from "@/entities/dashboard/api/queries"
import { TodayAppointmentsList } from "./TodayAppointmentsList"

function money(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`
}

export function ClinicDashboard({ canSeeRevenue }: { canSeeRevenue: boolean }) {
  const { data: appointments } = useTodayAppointmentsCount()
  const { data: revenue } = useTodayRevenue()
  const { data: patientsCount } = useActivePatientsCount()
  const { data: recallsCount } = useUpcomingRecallsCount()

  const cancelledToday =
    appointments?.filter((a) => a.status === "cancelled").length ?? 0

  return (
    <div className="space-y-6">
      <div
        className={
          canSeeRevenue
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            : "grid grid-cols-1 sm:grid-cols-3 gap-4"
        }
      >
        <StatTile
          label="Bugungi qabullar"
          value={String(appointments?.length ?? 0)}
          icon={CalendarCheck}
        />
        {canSeeRevenue && (
          <StatTile
            label="Bugungi tushum"
            value={money(revenue ?? 0)}
            icon={Wallet}
            tone="success"
          />
        )}
        <StatTile
          label="Bekor qilingan navbatlar"
          value={String(cancelledToday)}
          icon={CircleX}
          tone="destructive"
        />
        <StatTile
          label="Bemorlar (jami)"
          value={String(patientsCount ?? 0)}
          icon={Users2}
        />
      </div>

      {recallsCount !== undefined && recallsCount > 0 && (
        <p className="text-sm text-muted-foreground">
          Keyingi 7 kun ichida <span className="font-medium text-foreground">{recallsCount}</span>{" "}
          ta qayta chaqiruv eslatmasi yuboriladi.
        </p>
      )}

      <TodayAppointmentsList />
    </div>
  )
}
