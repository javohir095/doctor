import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { DatePicker } from "@/shared/ui/DatePicker"
import { useProfile } from "@/entities/session/api/queries"
import { useDoctors } from "@/entities/doctors/api/queries"
import { useServices } from "@/entities/services/api/queries"
import { createToothRecord } from "@/entities/teeth/api/mutations"
import {
  DIAGNOSIS_OPTIONS,
  TOOTH_STATUS_BADGE,
  TOOTH_STATUS_LABELS,
  type ToothRecordWithRelations,
  type ToothStatus,
} from "@/entities/teeth/model/types"
import { toDateInputValue } from "@/shared/lib/date"

const recordSchema = z.object({
  diagnosis: z.string().min(1, "Tashxisni tanlang"),
  description: z.string().optional(),
  record_date: z.string().min(1, "Sanani tanlang"),
  doctor_id: z.string().min(1, "Shifokorni tanlang"),
  service_id: z.string().optional(),
  price: z.coerce.number().min(0),
  status: z.enum(["planned", "in_progress", "completed", "removed"]),
})

type RecordInput = z.input<typeof recordSchema>
type RecordValues = z.output<typeof recordSchema>

function money(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`
}

export function ToothRecordDialog({
  toothNumber,
  patientId,
  history,
  onOpenChange,
}: {
  toothNumber: number | null
  patientId: string
  history: ToothRecordWithRelations[]
  onOpenChange: (open: boolean) => void
}) {
  const { data: profile } = useProfile()
  const { data: doctors } = useDoctors()
  const { data: services } = useServices(true)
  const queryClient = useQueryClient()

  const isDoctor = profile?.role === "doctor"

  const form = useForm<RecordInput, unknown, RecordValues>({
    resolver: zodResolver(recordSchema),
    values: {
      diagnosis: DIAGNOSIS_OPTIONS[0],
      description: "",
      record_date: toDateInputValue(new Date()),
      doctor_id: isDoctor ? (profile?.id ?? "") : "",
      service_id: undefined,
      price: 0,
      status: "planned",
    },
  })

  function handleServiceSelect(serviceId: string) {
    const service = services?.find((s) => s.id === serviceId)
    if (!service) return
    form.setValue("service_id", service.id)
    form.setValue("price", service.default_price)
  }

  async function onSubmit(values: RecordValues) {
    if (!profile || !toothNumber) return
    try {
      await createToothRecord({
        clinic_id: profile.clinic_id!,
        patient_id: patientId,
        tooth_number: toothNumber,
        diagnosis: values.diagnosis,
        description: values.description || null,
        record_date: values.record_date,
        doctor_id: values.doctor_id,
        service_id: values.service_id || null,
        price: values.price,
        status: values.status,
        created_by: profile.id,
      })
      await queryClient.invalidateQueries({ queryKey: ["tooth_records", { patientId }] })
      toast.success(`${toothNumber}-tish uchun yozuv qo'shildi`)
      form.reset()
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlashda xatolik")
    }
  }

  return (
    <Dialog open={toothNumber !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{toothNumber}-tish</DialogTitle>
        </DialogHeader>

        {history.length > 0 && (
          <div className="space-y-2">
            {history.map((r) => (
              <div key={r.id} className="rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.diagnosis}</span>
                  <Badge variant={TOOTH_STATUS_BADGE[r.status as ToothStatus]}>
                    {TOOTH_STATUS_LABELS[r.status as ToothStatus]}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  {format(new Date(r.record_date), "dd.MM.yyyy")} · {r.doctor?.full_name ?? "—"}
                  {r.price > 0 && <> · {money(r.price)}</>}
                </p>
                {r.description && <p className="mt-1">{r.description}</p>}
              </div>
            ))}
            <Separator />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tashxis</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIAGNOSIS_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Muolaja tavsifi</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Masalan: kompozit plomba qo'yildi"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Ixtiyoriy</FormDescription>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="record_date"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holat</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TOOTH_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mas'ul shifokor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isDoctor}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Shifokorni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isDoctor && profile && (
                        <SelectItem value={profile.id}>{profile.full_name}</SelectItem>
                      )}
                      {!isDoctor &&
                        doctors?.map((d) => (
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

            <FormField
              control={form.control}
              name="service_id"
              render={() => (
                <FormItem>
                  <FormLabel>Xizmat</FormLabel>
                  <Select onValueChange={handleServiceSelect}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Xizmatlar katalogidan tanlang" />
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
                  <FormDescription>Ixtiyoriy, tanlanganda narx avtomatik to'ldiriladi</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narx (so'm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={(field.value as number | string | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
