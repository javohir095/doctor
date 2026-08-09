import { useMemo } from "react"
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { AppointmentWithRelations } from "@/entities/appointments/model/types"
import { personColor } from "./person-colors"

const WEEKDAY_LABELS = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"]

export function MonthGrid({
  monthAnchor,
  appointments,
  onSelectDay,
}: {
  monthAnchor: Date
  appointments: AppointmentWithRelations[]
  onSelectDay: (date: Date) => void
}) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [monthAnchor])

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayAppointments = appointments.filter((a) =>
            isSameDay(new Date(a.scheduled_at), day)
          )
          const inMonth = isSameMonth(day, monthAnchor)
          const today = isToday(day)
          const visible = dayAppointments.slice(0, 3)
          const overflow = dayAppointments.length - visible.length

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex min-h-24 flex-col items-start gap-1 border-b border-r p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent",
                !inMonth && "bg-muted/20 text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  today && "bg-primary text-primary-foreground"
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex w-full flex-col gap-0.5">
                {visible.map((a) => {
                  const color = personColor(a.patient_id)
                  return (
                    <span
                      key={a.id}
                      className={cn("truncate rounded px-1 py-0.5 text-[10px] font-medium", color.bg, color.text)}
                    >
                      {a.patient?.full_name ?? "Navbat"}
                    </span>
                  )
                })}
                {overflow > 0 && (
                  <span className="text-[10px] text-muted-foreground">+{overflow} yana</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
