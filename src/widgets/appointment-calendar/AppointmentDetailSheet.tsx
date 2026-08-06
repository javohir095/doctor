import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { formatUzPhone } from "@/shared/lib/phone"
import { useProfile } from "@/entities/session/api/queries"
import {
  updateAppointment,
  deleteAppointment,
} from "@/entities/appointments/api/mutations"
import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentWithRelations,
} from "@/entities/appointments/model/types"
import { createRecall } from "@/entities/recalls/api/mutations"

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{appointment.patient?.full_name ?? "Navbat"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{appointment.patient?.phone ? formatUzPhone(appointment.patient.phone) : ""}</p>
            <p>Shifokor: {appointment.doctor?.full_name}</p>
            <p>{format(new Date(appointment.scheduled_at), "dd.MM.yyyy HH:mm")}</p>
            {appointment.service_name && <p>Xizmat: {appointment.service_name}</p>}
            {appointment.estimated_price != null && (
              <p>Taxminiy narx: {appointment.estimated_price.toLocaleString("uz-UZ")} so'm</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Holat</Label>
            <Select value={status} onValueChange={setStatus} disabled={!canEdit}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "completed" && (
            <div className="space-y-2">
              <Label>Keyingi tashrif (qayta chaqiruv) sanasi</Label>
              <Input
                type="date"
                value={recallDate}
                onChange={(e) => setRecallDate(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          )}

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
          <SheetFooter className="flex-row justify-between">
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
              Saqlash
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
