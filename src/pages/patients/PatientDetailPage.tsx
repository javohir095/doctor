import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { UZ_PHONE_REGEX, formatUzPhone } from "@/shared/lib/phone"
import { useProfile } from "@/entities/session/api/queries"
import { usePatient, usePatientMedicalNotes } from "@/entities/patients/api/queries"
import {
  updatePatient,
  upsertMedicalNotes,
  logPatientAccess,
} from "@/entities/patients/api/mutations"
import { PatientVisitHistory } from "@/widgets/patient-visit-history/PatientVisitHistory"
import { PatientTreatmentTab } from "@/widgets/patient-treatment/PatientTreatmentTab"

const infoSchema = z.object({
  full_name: z.string().min(2, "Ism-familiyani kiriting"),
  phone: z.string().regex(UZ_PHONE_REGEX, "Format: +998901234567"),
  birth_date: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})

type InfoValues = z.infer<typeof infoSchema>

function PatientInfoForm({ patientId }: { patientId: string }) {
  const { data: patient, isLoading } = usePatient(patientId)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const canEdit = profile?.role === "owner" || profile?.role === "admin"

  const form = useForm<InfoValues>({
    resolver: zodResolver(infoSchema),
    values: patient
      ? {
          full_name: patient.full_name,
          phone: patient.phone,
          birth_date: patient.birth_date ?? "",
          address: patient.address ?? "",
        }
      : undefined,
  })

  async function onSubmit(values: InfoValues) {
    try {
      await updatePatient(patientId, {
        full_name: values.full_name,
        phone: values.phone,
        birth_date: values.birth_date || null,
        address: values.address || null,
      })
      await queryClient.invalidateQueries({ queryKey: ["patient", patientId] })
      await queryClient.invalidateQueries({ queryKey: ["patients"] })
      toast.success("Ma'lumotlar saqlandi")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlashda xatolik")
    }
  }

  if (isLoading || !patient) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!canEdit) {
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Ism-familiya</dt>
          <dd className="font-medium">{patient.full_name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Telefon</dt>
          <dd className="font-medium">{formatUzPhone(patient.phone)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tug'ilgan sana</dt>
          <dd className="font-medium">{patient.birth_date ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Manzil</dt>
          <dd className="font-medium">{patient.address ?? "—"}</dd>
        </div>
      </dl>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
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
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input autoComplete="off" {...field} />
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
                <Input type="date" {...field} />
              </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Saqlash
        </Button>
      </form>
    </Form>
  )
}

function MedicalNotesCard({ patientId }: { patientId: string }) {
  const { data: profile } = useProfile()
  const { data: medicalNotes, isLoading } = usePatientMedicalNotes(patientId)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (medicalNotes) setNotes(medicalNotes.notes ?? "")
  }, [medicalNotes])

  // Admin's RLS grant excludes this table entirely — nothing to show, and
  // nothing they're allowed to write, so keep the card out of their view.
  if (profile?.role === "admin") return null

  async function handleSave() {
    if (!profile) return
    setIsSaving(true)
    try {
      await upsertMedicalNotes({
        patient_id: patientId,
        clinic_id: profile.clinic_id!,
        notes,
        updated_by: profile.id,
      })
      await queryClient.invalidateQueries({ queryKey: ["patient_medical_notes", patientId] })
      toast.success("Tibbiy tarix saqlandi")
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Saqlashda xatolik. Faqat bemorga biriktirilgan shifokor yoza oladi."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="size-4 text-warning" />
          Allergiya / surunkali kasalliklar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: penitsillinga allergiya, qandli diabet..."
              rows={4}
            />
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              Saqlash
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { data: profile } = useProfile()

  useEffect(() => {
    if (patientId && profile) {
      logPatientAccess({
        clinic_id: profile.clinic_id!,
        user_id: profile.id,
        patient_id: patientId,
      }).catch(() => {})
    }
  }, [patientId, profile])

  if (!patientId) return null

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/patients">
          <ArrowLeft className="size-4" />
          Bemorlar ro'yxatiga qaytish
        </Link>
      </Button>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Umumiy ma'lumot</TabsTrigger>
          <TabsTrigger value="history">Tashriflar tarixi</TabsTrigger>
          <TabsTrigger value="treatment">Davolash va to'lov</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="space-y-6 mt-4">
          <PatientInfoForm patientId={patientId} />
          <MedicalNotesCard patientId={patientId} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <PatientVisitHistory patientId={patientId} />
        </TabsContent>
        <TabsContent value="treatment" className="mt-4">
          <PatientTreatmentTab patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
