import { Fragment, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useProfile } from "@/entities/session/api/queries"
import { useDoctors } from "@/entities/doctors/api/queries"
import { useAppointmentsInRange } from "@/entities/appointments/api/queries"
import type { AppointmentWithRelations } from "@/entities/appointments/model/types"
import { NewAppointmentDialog } from "@/widgets/appointment-calendar/NewAppointmentDialog"
import { AppointmentDetailSheet } from "@/widgets/appointment-calendar/AppointmentDetailSheet"
import { MonthGrid } from "@/widgets/appointment-calendar/MonthGrid"
import { personColor } from "@/widgets/appointment-calendar/person-colors"

type ViewMode = "day" | "week" | "month"

const CLINIC_OPEN_HOUR = 9
const CLINIC_CLOSE_HOUR = 18
const SLOT_MINUTES = 60

const WEEKDAY_LABELS = ["Dush", "Sesh", "Chor", "Pay", "Jum"]

function generateSlots() {
  const slots: { startMinutes: number; label: string }[] = []
  for (let m = CLINIC_OPEN_HOUR * 60; m < CLINIC_CLOSE_HOUR * 60; m += SLOT_MINUTES) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    slots.push({ startMinutes: m, label: `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}` })
  }
  return slots
}
const SLOTS = generateSlots()

function slotIndexFor(date: Date): number {
  const minutes = date.getHours() * 60 + date.getMinutes()
  let idx = 0
  for (let i = 0; i < SLOTS.length; i++) {
    if (minutes >= SLOTS[i].startMinutes) idx = i
  }
  return idx
}

function initial(name: string | undefined) {
  return (name?.trim()?.[0] ?? "?").toUpperCase()
}

function AppointmentChip({
  appointment,
  onOpenPatient,
  onOpenDetails,
}: {
  appointment: AppointmentWithRelations
  onOpenPatient: () => void
  onOpenDetails: () => void
}) {
  const color = personColor(appointment.patient_id)
  return (
    <div
      className={cn(
        "group relative w-full rounded-lg border-l-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
        color.bg,
        color.border
      )}
    >
      <button type="button" onClick={onOpenPatient} className="block w-full px-3 py-2 pr-8 text-left">
        <p className={cn("truncate text-sm font-semibold", color.text)}>
          {appointment.patient?.full_name ?? "Navbat"}
        </p>
        <p className={cn("truncate text-xs opacity-80", color.text)}>
          {appointment.service_name ?? "Xizmat yo'q"}
        </p>
        <p className={cn("truncate text-[11px] font-mono opacity-70", color.text)}>
          {format(new Date(appointment.scheduled_at), "HH:mm")}
        </p>
      </button>
      <button
        type="button"
        onClick={onOpenDetails}
        title="Navbat tafsilotlari"
        className={cn(
          "absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-110",
          color.dot
        )}
      >
        {initial(appointment.patient?.full_name)}
      </button>
    </div>
  )
}

function CalendarGrid({
  days,
  appointments,
  isLoading,
  onOpenPatient,
  onOpenDetails,
}: {
  days: Date[]
  appointments: AppointmentWithRelations[]
  isLoading: boolean
  onOpenPatient: (a: AppointmentWithRelations) => void
  onOpenDetails: (a: AppointmentWithRelations) => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const showNowLine = nowMinutes >= CLINIC_OPEN_HOUR * 60 && nowMinutes < CLINIC_CLOSE_HOUR * 60
  const nowSlotIdx = slotIndexFor(now)
  const nowFraction = (nowMinutes - SLOTS[Math.max(nowSlotIdx, 0)]?.startMinutes) / SLOT_MINUTES

  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <div
        className="grid min-w-[560px]"
        style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(150px, 1fr))` }}
      >
        <div className="border-b border-r" />
        {days.map((day, i) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-b p-2 text-center",
              i < days.length - 1 && "border-r",
              isToday(day) && "rounded-t-lg bg-primary/10"
            )}
          >
            <p className="text-xs text-muted-foreground uppercase">
              {WEEKDAY_LABELS[(day.getDay() + 6) % 7]}
            </p>
            <p className={cn("text-lg font-semibold", isToday(day) && "text-primary")}>
              {day.getDate()}
            </p>
          </div>
        ))}

        {SLOTS.map((slot, slotIdx) => (
          <Fragment key={slot.label}>
            <div className="border-b border-r p-2 text-xs text-muted-foreground">
              {slot.label}
            </div>
            {days.map((day, i) => {
              const cellAppointments = appointments.filter(
                (a) =>
                  isSameDay(new Date(a.scheduled_at), day) &&
                  slotIndexFor(new Date(a.scheduled_at)) === slotIdx
              )
              const isNowCell = showNowLine && slotIdx === nowSlotIdx && isToday(day)
              return (
                <div
                  key={`${day.toISOString()}-${slot.label}`}
                  className={cn(
                    "relative min-h-[64px] space-y-1.5 border-b p-1.5",
                    i < days.length - 1 && "border-r",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  {isNowCell && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                      style={{ top: `${nowFraction * 100}%` }}
                    >
                      <span className="-ml-1 size-1.5 shrink-0 rounded-full bg-destructive" />
                      <span className="h-px w-full bg-destructive" />
                    </div>
                  )}
                  {cellAppointments.map((a) => (
                    <AppointmentChip
                      key={a.id}
                      appointment={a}
                      onOpenPatient={() => onOpenPatient(a)}
                      onOpenDetails={() => onOpenDetails(a)}
                    />
                  ))}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: doctors } = useDoctors()
  const [view, setView] = useState<ViewMode>("week")
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()))
  const [doctorFilter, setDoctorFilter] = useState<string>("all")
  const [selected, setSelected] = useState<AppointmentWithRelations | null>(null)

  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  const monthAnchor = startOfMonth(anchorDate)

  let rangeStart: Date
  let rangeEnd: Date
  let days: Date[]
  if (view === "day") {
    rangeStart = anchorDate
    rangeEnd = addDays(anchorDate, 1)
    days = [anchorDate]
  } else if (view === "week") {
    rangeStart = weekStart
    rangeEnd = addDays(weekStart, 5)
    days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
  } else {
    rangeStart = startOfWeek(monthAnchor, { weekStartsOn: 1 })
    rangeEnd = addDays(rangeStart, 42)
    days = []
  }

  const effectiveDoctorId = profile?.role === "doctor" ? profile.id : undefined

  const { data: appointments, isLoading } = useAppointmentsInRange(
    rangeStart.toISOString(),
    rangeEnd.toISOString(),
    effectiveDoctorId
  )

  const visibleAppointments =
    doctorFilter === "all"
      ? (appointments ?? [])
      : (appointments ?? []).filter((a) => a.doctor_id === doctorFilter)

  const patientLegend = Array.from(
    new Map(
      visibleAppointments
        .filter((a) => a.patient?.full_name)
        .map((a) => [a.patient_id, a.patient!.full_name])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  function goPrev() {
    if (view === "day") setAnchorDate((d) => addDays(d, -1))
    else if (view === "week") setAnchorDate((d) => addWeeks(d, -1))
    else setAnchorDate((d) => startOfDay(subMonths(d, 1)))
  }
  function goNext() {
    if (view === "day") setAnchorDate((d) => addDays(d, 1))
    else if (view === "week") setAnchorDate((d) => addWeeks(d, 1))
    else setAnchorDate((d) => startOfDay(addMonths(d, 1)))
  }
  function goToday() {
    setAnchorDate(startOfDay(new Date()))
  }

  const rangeLabel =
    view === "day"
      ? format(anchorDate, "dd.MM.yyyy")
      : view === "week"
        ? `${format(weekStart, "dd.MM")} — ${format(addDays(weekStart, 4), "dd.MM.yyyy")}`
        : format(monthAnchor, "MMMM yyyy")

  const showDoctorControls = profile?.role !== "doctor" && doctors && doctors.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Navbatlar</h1>
          <p className="text-muted-foreground text-sm">{rangeLabel}</p>
        </div>
        <NewAppointmentDialog defaultDate={anchorDate} />
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-3">
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

          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {(
              [
                ["day", "Kun"],
                ["week", "Hafta"],
                ["month", "Oy"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {showDoctorControls && (
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha shifokorlar</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Badge variant="outline" className="font-normal text-muted-foreground sm:ml-auto">
            {SLOTS[0].label} — {String(CLINIC_CLOSE_HOUR).padStart(2, "0")}:00
          </Badge>
        </div>

        {patientLegend.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {patientLegend.map(([patientId, name]) => (
              <span key={patientId} className="flex items-center gap-1.5">
                <span className={cn("size-2 shrink-0 rounded-full", personColor(patientId).dot)} />
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {view === "month" ? (
        isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <MonthGrid
            monthAnchor={monthAnchor}
            appointments={visibleAppointments}
            onSelectDay={(day) => {
              setAnchorDate(day)
              setView("day")
            }}
          />
        )
      ) : (
        <CalendarGrid
          days={days}
          appointments={visibleAppointments}
          isLoading={isLoading}
          onOpenPatient={(a) => navigate(`/patients/${a.patient_id}`)}
          onOpenDetails={setSelected}
        />
      )}

      <AppointmentDetailSheet
        appointment={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
