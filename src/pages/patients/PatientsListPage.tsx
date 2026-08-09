import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Search, UserRoundSearch } from "lucide-react"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UZ_PHONE_REGEX, formatUzPhone } from "@/shared/lib/phone"
import { EmptyState } from "@/shared/ui/EmptyState"
import { DatePicker } from "@/shared/ui/DatePicker"
import { useProfile } from "@/entities/session/api/queries"
import { usePatients } from "@/entities/patients/api/queries"
import { createPatient } from "@/entities/patients/api/mutations"

const patientSchema = z.object({
  full_name: z.string().min(2, "Ism-familiyani kiriting"),
  phone: z.string().regex(UZ_PHONE_REGEX, "Format: +998901234567"),
  birth_date: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})

type PatientValues = z.infer<typeof patientSchema>

function AddPatientDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { full_name: "", phone: "", birth_date: "", address: "" },
  })

  async function onSubmit(values: PatientValues) {
    if (!profile) return
    setError(null)
    setIsSubmitting(true)
    try {
      const patient = await createPatient({
        full_name: values.full_name,
        phone: values.phone,
        birth_date: values.birth_date || null,
        address: values.address || null,
        clinic_id: profile.clinic_id!,
        created_by: profile.id,
      })
      await queryClient.invalidateQueries({ queryKey: ["patients"] })
      toast.success("Bemor qo'shildi")
      setOpen(false)
      form.reset()
      navigate(`/patients/${patient.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bemor qo'shishda xatolik")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Yangi bemor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi bemor ro'yxatga olish</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ism-familiya</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
          
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon raqami</FormLabel>
                  <FormControl>
                    <Input placeholder="+998901234567" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tug'ilgan sana</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      fromYear={new Date().getFullYear() - 100}
                      toYear={new Date().getFullYear()}
                    />
                  </FormControl>
                  <FormDescription>Ixtiyoriy</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manzil</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormDescription>Ixtiyoriy</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saqlanmoqda..." : "Ro'yxatga olish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function PatientsListPage() {
  const [search, setSearch] = useState("")
  const { data: patients, isLoading } = usePatients(search)
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bemorlar</h1>
          <p className="text-muted-foreground text-sm">
            Ism yoki telefon raqami bo'yicha qidiring
          </p>
        </div>
        <AddPatientDialog />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Ism yoki telefon..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism-familiya</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Birinchi tashrif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <TableCell className="font-medium">{patient.full_name}</TableCell>
                  <TableCell>{formatUzPhone(patient.phone)}</TableCell>
                  <TableCell>{patient.first_visit_date}</TableCell>
                </TableRow>
              ))}
              {patients?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <EmptyState
                      icon={UserRoundSearch}
                      title="Bemorlar topilmadi"
                      description="Qidiruv so'zini o'zgartiring yoki yangi bemor qo'shing"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
