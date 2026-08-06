import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Wallet } from "lucide-react"
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
import { recordPayment } from "@/entities/treatments/api/mutations"
import { PAYMENT_TYPE_LABELS } from "@/entities/treatments/model/types"

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Summa noldan katta bo'lishi kerak"),
  payment_type: z.enum(["cash", "uzcard", "humo", "click", "payme"]),
})

type PaymentInput = z.input<typeof paymentSchema>
type PaymentValues = z.output<typeof paymentSchema>

export function RecordPaymentDialog({
  patientId,
  treatmentPlanId,
  remainingAmount,
}: {
  patientId: string
  treatmentPlanId: string
  remainingAmount: number
}) {
  const [open, setOpen] = useState(false)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  const form = useForm<PaymentInput, unknown, PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: remainingAmount > 0 ? remainingAmount : 0, payment_type: "cash" },
  })

  async function onSubmit(values: PaymentValues) {
    if (!profile) return
    try {
      await recordPayment({
        clinic_id: profile.clinic_id!,
        patient_id: patientId,
        treatment_plan_id: treatmentPlanId,
        amount: values.amount,
        payment_type: values.payment_type,
        received_by: profile.id,
      })
      await queryClient.invalidateQueries({ queryKey: ["treatment_plan_balances", { patientId }] })
      await queryClient.invalidateQueries({ queryKey: ["payments", { patientId }] })
      toast.success("To'lov qabul qilindi")
      setOpen(false)
      form.reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "To'lovda xatolik")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Wallet className="size-4" />
          To'lov qabul qilish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>To'lov qabul qilish</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summa (so'm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value as number | string | undefined ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To'lov turi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
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
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Tasdiqlash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
