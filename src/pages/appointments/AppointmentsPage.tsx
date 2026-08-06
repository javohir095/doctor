import { useMemo, useState } from "react"
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, CalendarX2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProfile } from "@/entities/session/api/queries"
import { useDoctors } from "@/entities/doctors/api/queries"
import { useAppointmentsInRange } from "@/entities/appointments/api/queries"
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentWithRelations,
} from "@/entities/appointments/model/types"
import { NewAppointmentDialog } from "@/widgets/appointment-calendar/NewAppointmentDialog"
import { AppointmentDetailSheet } from "@/widgets/appointment-calendar/AppointmentDetailSheet"
import { EmptyState } from "@/shared/ui/EmptyState"

function AppointmentRow({
  appointment,
  onClick,
}: {
  appointment: AppointmentWithRelations
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="w-full flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-sm text-muted-foreground shrink-0">
          {format(new Date(appointment.scheduled_at), "HH:mm")}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate">{appointment.patient?.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {appointment.doctor?.full_name} · {appointment.service_name ?? "Xizmat yo'q"}
          </p>
        </div>
      </div>
      <Badge variant={APPOINTMENT_STATUS_BADGE[appointment.status]} className="shrink-0">
        {APPOINTMENT_STATUS_LABELS[appointment.status]}
      </Badge>
    </motion.button>
  )
}

function DayColumn({
  date,
  appointments,
  isLoading,
  onSelect,
  compact = false,
}: {
  date: Date
  appointments: AppointmentWithRelations[]
  isLoading: boolean
  onSelect: (a: AppointmentWithRelations) => void
  compact?: boolean
}) {
  return (
    <div className="space-y-2">
      <p className={compact ? "text-sm font-medium" : "sr-only"}>
        {format(date, "dd.MM")} · {["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"][date.getDay()]}
      </p>
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : appointments.length === 0 ? (
        compact ? (
          <p className="text-xs text-muted-foreground py-2">Navbat yo'q</p>
        ) : (
          <EmptyState icon={CalendarX2} title="Bugun navbat yo'q" />
        )
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <AppointmentRow key={a.id} appointment={a} onClick={() => onSelect(a)} />
          ))}
        </div>
      )}
    </div>
  )
}

export function AppointmentsPage() {
  const { data: profile } = useProfile()
  const { data: doctors } = useDoctors()
  const [view, setView] = useState<"day" | "week">("day")
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()))
  const [doctorFilter, setDoctorFilter] = useState<string>("all")
  const [selected, setSelected] = useState<AppointmentWithRelations | null>(null)

  const effectiveDoctorId =
    profile?.role === "doctor" ? profile.id : doctorFilter === "all" ? undefined : doctorFilter

  const rangeStart = view === "day" ? anchorDate : startOfWeek(anchorDate, { weekStartsOn: 1 })
  const rangeEnd = view === "day" ? addDays(rangeStart, 1) : addDays(rangeStart, 7)

  const { data: appointments, isLoading } = useAppointmentsInRange(
    rangeStart.toISOString(),
    rangeEnd.toISOString(),
    effectiveDoctorId
  )

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(rangeStart, i)),
    [rangeStart]
  )

  function goPrev() {
    setAnchorDate((d) => (view === "day" ? addDays(d, -1) : addWeeks(d, -1)))
  }
  function goNext() {
    setAnchorDate((d) => (view === "day" ? addDays(d, 1) : addWeeks(d, 1)))
  }
  function goToday() {
    setAnchorDate(startOfDay(new Date()))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Navbatlar</h1>
          <p className="text-muted-foreground text-sm">
            {view === "day"
              ? format(anchorDate, "dd.MM.yyyy")
              : `${format(rangeStart, "dd.MM")} — ${format(addDays(rangeStart, 6), "dd.MM.yyyy")}`}
          </p>
        </div>
        <NewAppointmentDialog defaultDate={anchorDate} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={goPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" onClick={goToday}>
            Bugun
          </Button>
          <Button variant="outline" size="icon" onClick={goNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
          <TabsList>
            <TabsTrigger value="day">Kunlik</TabsTrigger>
            <TabsTrigger value="week">Haftalik</TabsTrigger>
          </TabsList>
        </Tabs>

        {profile?.role !== "doctor" && (
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Barcha shifokorlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha shifokorlar</SelectItem>
              {doctors?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {view === "day" ? (
        <DayColumn
          date={anchorDate}
          appointments={appointments ?? []}
          isLoading={isLoading}
          onSelect={setSelected}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="rounded-lg border p-3 bg-card">
              <DayColumn
                date={day}
                appointments={(appointments ?? []).filter((a) =>
                  isSameDay(new Date(a.scheduled_at), day)
                )}
                isLoading={isLoading}
                onSelect={setSelected}
                compact
              />
            </div>
          ))}
        </div>
      )}

      <AppointmentDetailSheet
        appointment={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
