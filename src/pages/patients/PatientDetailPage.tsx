import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft, CalendarPlus, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
import { DatePicker } from "@/shared/ui/DatePicker"
import { UZ_PHONE_REGEX } from "@/shared/lib/phone"
import { useProfile } from "@/entities/session/api/queries"
import { usePatient, usePatientMedicalNotes } from "@/entities/patients/api/queries"
import {
  updatePatient,
  upsertMedicalNotes,
  logPatientAccess,
} from "@/entities/patients/api/mutations"
import { PatientVisitHistory } from "@/widgets/patient-visit-history/PatientVisitHistory"
import { PatientTreatmentTab } from "@/widgets/patient-treatment/PatientTreatmentTab"
import { PatientOdontogramTab } from "@/widgets/odontogram/PatientOdontogramTab"
import { NewAppointmentDialog } from "@/widgets/appointment-calendar/NewAppointmentDialog"

const infoSchema = z.object({
  full_name: z.string().min(2, "Ism-familiyani kiriting"),
  phone: z.string().regex(UZ_PHONE_REGEX, "Format: +998901234567"),
  birth_date: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  medical_notes: z.string().optional(),
})

type InfoValues = z.infer<typeof infoSchema>

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/** Single card covering both patient identity fields and the allergy/chronic
 * notes — previously two separate forms with two separate save buttons.
 * Permissions still differ per field group (owner/admin edit the identity
 * fields, owner/treating-doctor edit medical notes, admin never sees medical
 * notes at all), but they now share one form and one submit. */
function PatientInfoCard({ patientId }: { patientId: string }) {
  const { data: patient, isLoading: patientLoading } = usePatient(patientId)
  const { data: medicalNotes, isLoading: notesLoading } = usePatientMedicalNotes(patientId)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  const canEditInfo = profile?.role === "owner" || profile?.role === "admin"
  // Admin's RLS grant excludes patient_medical_notes entirely — medical data
  // stays doctor/owner-only, so keep the section out of their view.
  const canSeeMedical = profile?.role === "owner" || profile?.role === "doctor"

  const form = useForm<InfoValues>({
    resolver: zodResolver(infoSchema),
    values: patient
      ? {
          full_name: patient.full_name,
          phone: patient.phone,
          birth_date: patient.birth_date ?? "",
          address: patient.address ?? "",
          medical_notes: medicalNotes?.notes ?? "",
        }
      : undefined,
  })

  async function onSubmit(values: InfoValues) {
    if (!profile) return
    try {
      const tasks: Promise<unknown>[] = []
      if (canEditInfo) {
        tasks.push(
          updatePatient(patientId, {
            full_name: values.full_name,
            phone: values.phone,
            birth_date: values.birth_date || null,
            address: values.address || null,
          })
        )
      }
      if (canSeeMedical) {
        tasks.push(
          upsertMedicalNotes({
            patient_id: patientId,
            clinic_id: profile.clinic_id!,
            notes: values.medical_notes ?? "",
            updated_by: profile.id,
          })
        )
      }
      await Promise.all(tasks)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient", patientId] }),
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["patient_medical_notes", patientId] }),
      ])
      toast.success("Ma'lumotlar saqlandi")
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Saqlashda xatolik. Faqat bemorga biriktirilgan shifokor tibbiy tarixni yoza oladi."
      )
    }
  }

  if (patientLoading || !patient) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(patient.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-heading font-medium truncate">{patient.full_name}</p>
          <p className="text-sm text-muted-foreground">
            Birinchi tashrif: {format(new Date(patient.first_visit_date), "dd.MM.yyyy")}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ism-familiya</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" disabled={!canEditInfo} {...field} />
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
                      <Input autoComplete="off" disabled={!canEditInfo} {...field} />
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
                        disabled={!canEditInfo}
                        fromYear={new Date().getFullYear() - 100}
                        toYear={new Date().getFullYear()}
                      />
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
                      <Input autoComplete="off" disabled={!canEditInfo} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {canSeeMedical && (
              <>
                <Separator />
                <FormField
                  control={form.control}
                  name="medical_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ShieldAlert className="size-4 text-warning" />
                        Allergiya / surunkali kasalliklar
                      </FormLabel>
                      <FormControl>
                        {notesLoading ? (
                          <Skeleton className="h-24 w-full" />
                        ) : (
                          <Textarea
                            placeholder="Masalan: penitsillinga allergiya, qandli diabet..."
                            rows={4}
                            {...field}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(canEditInfo || canSeeMedical) && (
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Saqlash
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { data: profile } = useProfile()
  const { data: patient } = usePatient(patientId)
  const canBookAppointment = profile?.role === "owner" || profile?.role === "admin"
  const canSeeOdontogram = profile?.role === "owner" || profile?.role === "doctor"

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
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/patients">
            <ArrowLeft className="size-4" />
            Bemorlar ro'yxatiga qaytish
          </Link>
        </Button>
        {canBookAppointment && patient && (
          <NewAppointmentDialog
            defaultDate={new Date()}
            fixedPatient={{ id: patient.id, full_name: patient.full_name }}
            trigger={
              <Button size="sm">
                <CalendarPlus className="size-4" />
                Yangi qabul belgilash
              </Button>
            }
          />
        )}
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Umumiy ma'lumot</TabsTrigger>
          {canSeeOdontogram && <TabsTrigger value="teeth">Tish jadvali</TabsTrigger>}
          <TabsTrigger value="history">Tashriflar tarixi</TabsTrigger>
          <TabsTrigger value="treatment">Davolash va to'lov</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <PatientInfoCard patientId={patientId} />
        </TabsContent>
        {canSeeOdontogram && (
          <TabsContent value="teeth" className="mt-4">
            <PatientOdontogramTab patientId={patientId} />
          </TabsContent>
        )}
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
