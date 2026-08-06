import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useProfile } from "@/entities/session/api/queries"
import { useServices } from "@/entities/services/api/queries"
import { createTreatmentPlan } from "@/entities/treatments/api/mutations"

const itemSchema = z.object({
  service_id: z.string().optional(),
  service_name: z.string().min(1, "Xizmatni tanlang"),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().min(1),
})

const planSchema = z.object({
  title: z.string().optional(),
  items: z.array(itemSchema).min(1, "Kamida bitta xizmat qo'shing"),
})

type PlanInput = z.input<typeof planSchema>
type PlanValues = z.output<typeof planSchema>

export function NewTreatmentPlanDialog({
  patientId,
  doctorId,
}: {
  patientId: string
  doctorId: string
}) {
  const [open, setOpen] = useState(false)
  const { data: profile } = useProfile()
  const { data: services } = useServices(true)
  const queryClient = useQueryClient()

  const form = useForm<PlanInput, unknown, PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: "",
      items: [{ service_id: undefined, service_name: "", price: 0, quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const items = form.watch("items")
  const total = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  )

  function handleServiceSelect(index: number, serviceId: string) {
    const service = services?.find((s) => s.id === serviceId)
    if (!service) return
    form.setValue(`items.${index}.service_id`, service.id)
    form.setValue(`items.${index}.service_name`, service.name)
    form.setValue(`items.${index}.price`, service.default_price)
  }

  async function onSubmit(values: PlanValues) {
    if (!profile) return
    try {
      await createTreatmentPlan(
        {
          clinic_id: profile.clinic_id!,
          patient_id: patientId,
          doctor_id: doctorId,
          title: values.title || null,
        },
        values.items.map((item) => ({
          service_id: item.service_id || null,
          service_name: item.service_name,
          price: item.price,
          quantity: item.quantity,
        }))
      )
      await queryClient.invalidateQueries({ queryKey: ["treatment_plans", { patientId }] })
      await queryClient.invalidateQueries({ queryKey: ["treatment_plan_balances", { patientId }] })
      toast.success("Davolash rejasi yaratildi")
      setOpen(false)
      form.reset({ title: "", items: [{ service_id: undefined, service_name: "", price: 0, quantity: 1 }] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik yuz berdi")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Yangi davolash rejasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Davolash rejasi yaratish</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomi (ixtiyoriy)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: 2-tish davolash + protez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Xizmatlar</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Select onValueChange={(v) => handleServiceSelect(index, v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Xizmatni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.items?.[index]?.service_name && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.items[index]?.service_name?.message}
                      </p>
                    )}
                  </div>
                  <Input
                    type="number"
                    className="w-28"
                    placeholder="Narx"
                    {...form.register(`items.${index}.price`)}
                  />
                  <Input
                    type="number"
                    className="w-16"
                    placeholder="Soni"
                    min={1}
                    {...form.register(`items.${index}.quantity`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ service_id: undefined, service_name: "", price: 0, quantity: 1 })
                }
              >
                <Plus className="size-4" />
                Xizmat qo'shish
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-3 font-medium">
              <span>Umumiy summa</span>
              <span>{total.toLocaleString("uz-UZ")} so'm</span>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Rejani yaratish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
