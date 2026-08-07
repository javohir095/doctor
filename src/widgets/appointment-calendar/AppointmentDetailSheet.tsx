import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import {
  Trash2,
  Phone,
  User,
  CalendarClock,
  Stethoscope,
  Banknote,
  Clock,
  CheckCircle2,
  CheckCheck,
  UserX,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { formatUzPhone } from "@/shared/lib/phone"
import { useProfile } from "@/entities/session/api/queries"
import {
  updateAppointment,
  deleteAppointment,
} from "@/entities/appointments/api/mutations"
import { type AppointmentWithRelations } from "@/entities/appointments/model/types"
import { createRecall } from "@/entities/recalls/api/mutations"

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; active: string; dot: string }
> = {
  scheduled: {
    label: "Rejalashtirilgan",
    icon: Clock,
    active: "border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  confirmed: {
    label: "Tasdiqlangan",
    icon: CheckCircle2,
    active: "border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  completed: {
    label: "Yakunlandi",
    icon: CheckCheck,
    active: "border-success/40 bg-success/10 text-success",
    dot: "bg-success",
  },
  no_show: {
    label: "Kelmadi",
    icon: UserX,
    active: "border-warning/40 bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  cancelled: {
    label: "Bekor qilindi",
    icon: XCircle,
    active: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AppointmentDetailSheet({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState(appointment?.status ?? "scheduled")
  const [notes, setNotes] = useState(appointment?.notes ?? "")
  const [recallDate, setRecallDate] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  if (!appointment) return null

  const canEdit =
    profile?.role === "owner" ||
    profile?.role === "admin" ||
    (profile?.role === "doctor" && profile.id === appointment.doctor_id)

  async function handleSave() {
    if (!profile) return
    setIsSaving(true)
    try {
      await updateAppointment(appointment!.id, { status, notes: notes || null })

      if (status === "completed" && recallDate) {
        await createRecall({
          clinic_id: profile.clinic_id!,
          patient_id: appointment!.patient_id,
          doctor_id: appointment!.doctor_id,
          appointment_id: appointment!.id,
          recall_date: recallDate,
        })
      }

      await queryClient.invalidateQueries({ queryKey: ["appointments"] })
      await queryClient.invalidateQueries({ queryKey: ["recalls"] })
      toast.success("Navbat yangilandi")
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlashda xatolik")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteAppointment(appointment!.id)
      await queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Navbat o'chirildi")
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O'chirishda xatolik")
    }
  }

  const patientName = appointment.patient?.full_name ?? "Navbat"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md gap-0 p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle className="sr-only">{patientName}</SheetTitle>
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(patientName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-heading font-medium truncate">{patientName}</p>
              {appointment.patient?.phone && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="size-3" />
                  {formatUzPhone(appointment.patient.phone)}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="size-3.5 shrink-0" />
              <span className="text-foreground">{appointment.doctor?.full_name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="size-3.5 shrink-0" />
              <span className="text-foreground">
                {format(new Date(appointment.scheduled_at), "dd.MM.yyyy, HH:mm")}
              </span>
            </div>
            {appointment.service_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="size-3.5 shrink-0" />
                <span className="text-foreground">{appointment.service_name}</span>
              </div>
            )}
            {appointment.estimated_price != null && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="size-3.5 shrink-0" />
                <span className="text-foreground">
                  {appointment.estimated_price.toLocaleString("uz-UZ")} so'm
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Holat</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([value, config]) => {
                const Icon = config.icon
                const isActive = status === value
                return (
                  <motion.button
                    key={value}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => setStatus(value)}
                    whileTap={canEdit ? { scale: 0.97 } : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                      isActive
                        ? config.active
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{config.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {status === "completed" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 rounded-lg border border-success/30 bg-success/5 p-3">
                  <Label>Keyingi tashrif (qayta chaqiruv) sanasi</Label>
                  <Input
                    type="date"
                    value={recallDate}
                    onChange={(e) => setRecallDate(e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label>Izoh</Label>
            <Textarea
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={!canEdit}
            />
          </div>
        </div>

        {canEdit && (
          <>
            <Separator />
            <SheetFooter className="flex-row justify-between p-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Navbatni o'chirish</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu amalni ortga qaytarib bo'lmaydi.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>O'chirish</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
