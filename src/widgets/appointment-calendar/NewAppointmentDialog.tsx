import { useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PatientCombobox } from "@/shared/ui/PatientCombobox"
import { DatePicker } from "@/shared/ui/DatePicker"
import { useProfile } from "@/entities/session/api/queries"
import { useDoctors } from "@/entities/doctors/api/queries"
import { useServices } from "@/entities/services/api/queries"
import { createAppointment } from "@/entities/appointments/api/mutations"
import { toDateInputValue } from "@/shared/lib/date"

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Bemorni tanlang"),
  doctorId: z.string().min(1, "Shifokorni tanlang"),
  date: z.string().min(1, "Sanani tanlang"),
  time: z.string().min(1, "Vaqtni tanlang"),
  serviceId: z.string().optional(),
  serviceName: z.string().optional(),
  estimatedPrice: z.coerce.number().min(0).optional(),
  durationMinutes: z.coerce.number().min(5).default(30),
  notes: z.string().optional(),
})

type AppointmentInput = z.input<typeof appointmentSchema>
type AppointmentValues = z.output<typeof appointmentSchema>

export function NewAppointmentDialog({
  defaultDate,
  fixedPatient,
  trigger,
}: {
  defaultDate: Date
  /** When set, books for this patient directly and hides the patient picker
   * — used from the patient detail page, where the patient is already known. */
  fixedPatient?: { id: string; full_name: string }
  trigger?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patient, setPatient] = useState<{ id: string; full_name: string } | null>(
    fixedPatient ?? null
  )
  const { data: profile } = useProfile()
  const { data: doctors } = useDoctors()
  const { data: services } = useServices(true)
  const queryClient = useQueryClient()

  const form = useForm<AppointmentInput, unknown, AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: fixedPatient?.id ?? "",
      doctorId: profile?.role === "doctor" ? profile.id : "",
      date: toDateInputValue(defaultDate),
      time: "09:00",
      durationMinutes: 30,
      notes: "",
    },
  })

  function handleServiceSelect(serviceId: string) {
    const service = services?.find((s) => s.id === serviceId)
    if (!service) return
    form.setValue("serviceId", service.id)
    form.setValue("serviceName", service.name)
    form.setValue("estimatedPrice", service.default_price)
  }

  async function onSubmit(values: AppointmentValues) {
    if (!profile) return
    setError(null)
    try {
      const scheduledAt = new Date(`${values.date}T${values.time}:00`)
      await createAppointment({
        clinic_id: profile.clinic_id!,
        patient_id: values.patientId,
        doctor_id: values.doctorId,
        service_id: values.serviceId || null,
        service_name: values.serviceName || null,
        estimated_price: values.estimatedPrice ?? null,
        duration_minutes: values.durationMinutes,
        scheduled_at: scheduledAt.toISOString(),
        notes: values.notes || null,
        created_by: profile.id,
      })
      await queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Navbat yaratildi")
      setOpen(false)
      form.reset()
      setPatient(fixedPatient ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Navbat yaratishda xatolik")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            Yangi navbat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {fixedPatient ? `${fixedPatient.full_name} — yangi navbat` : "Yangi navbat yaratish"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!fixedPatient && (
              <FormField
                control={form.control}
                name="patientId"
                render={() => (
                  <FormItem>
                    <FormLabel>Bemor</FormLabel>
                    <FormControl>
                      <PatientCombobox
                        value={patient}
                        onChange={(p) => {
                          setPatient(p)
                          form.setValue("patientId", p.id)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shifokor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={profile?.role === "doctor"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Shifokorni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sana</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaqt</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="serviceId"
              render={() => (
                <FormItem>
                  <FormLabel>Xizmat turi</FormLabel>
                  <Select onValueChange={handleServiceSelect}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Xizmatni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Ixtiyoriy</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxminiy narx (so'm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value as number | string | undefined ?? ""}
                    />
                  </FormControl>
                  <FormDescription>Xizmat tanlanganda avtomatik to'ldiriladi, o'zgartirish mumkin</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormDescription>Ixtiyoriy</FormDescription>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Navbat yaratish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
