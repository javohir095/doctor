import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Building2, Users2, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmptyState } from "@/shared/ui/EmptyState"
import { UZ_PHONE_REGEX } from "@/shared/lib/phone"
import { USERNAME_REGEX } from "@/shared/lib/username"
import { signupClinic } from "@/entities/session/api/mutations"
import { useAllClinics, type ClinicWithCounts } from "@/entities/clinics-admin/api/queries"
import { setClinicActive } from "@/entities/clinics-admin/api/mutations"
import { BranchManager } from "@/widgets/branches/BranchManager"

const createClinicSchema = z.object({
  clinicName: z.string().min(2, "Klinika nomini kiriting"),
  fullName: z.string().min(2, "Egasining ism-familiyasini kiriting"),
  phone: z
    .string()
    .regex(UZ_PHONE_REGEX, "Format: +998901234567")
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .regex(USERNAME_REGEX, "Faqat harf, raqam va pastki chiziq (3-20 belgi)"),
  password: z.string().min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak"),
})

type CreateClinicValues = z.infer<typeof createClinicSchema>

function CreateClinicDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<CreateClinicValues>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: { clinicName: "", fullName: "", phone: "", username: "", password: "" },
  })

  async function onSubmit(values: CreateClinicValues) {
    setError(null)
    try {
      await signupClinic({
        clinicName: values.clinicName,
        fullName: values.fullName,
        phone: values.phone || undefined,
        username: values.username,
        password: values.password,
      })
      await queryClient.invalidateQueries({ queryKey: ["clinics-admin"] })
      toast.success("Klinika yaratildi")
      setOpen(false)
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klinika yaratishda xatolik")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Yangi klinika
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi klinika (kompaniya) qo'shish</DialogTitle>
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
              name="clinicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klinika nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Dent Plus" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klinika egasining ism-familiyasi</FormLabel>
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
                    <Input placeholder="+998901234567" autoComplete="off" {...field} />
                  </FormControl>
                  <FormDescription>Ixtiyoriy</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Egasi uchun login</FormLabel>
                  <FormControl>
                    <Input placeholder="masalan: dentplus_owner" autoComplete="off" autoCapitalize="off" {...field} />
                  </FormControl>
                  <FormDescription>Faqat harf, raqam va pastki chiziq</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaqtinchalik parol</FormLabel>
                  <FormControl>
                    <Input autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Bu login/parolni klinika egasiga o'zingiz yetkazing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Klinika yaratish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ClinicRow({ clinic }: { clinic: ClinicWithCounts }) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()

  async function handleToggleActive(checked: boolean) {
    try {
      await setClinicActive(clinic.id, checked)
      await queryClient.invalidateQueries({ queryKey: ["clinics-admin"] })
      toast.success(checked ? "Klinika faollashtirildi" : "Klinika to'xtatildi")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik yuz berdi")
    }
  }

  return (
    <Card>
      <CardContent>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 text-left"
        >
          {expanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{clinic.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {clinic.phone ?? "Telefon kiritilmagan"}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Users2 className="size-4" />
              {clinic.staffCount}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="size-4" />
              {clinic.branchCount}
            </span>
          </div>
        </button>
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Badge variant={clinic.is_active ? "secondary" : "outline"} className={clinic.is_active ? "bg-success/15 text-success-foreground border-success/30" : ""}>
            {clinic.is_active ? "Faol" : "To'xtatilgan"}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Faol</span>
            <Switch checked={clinic.is_active} onCheckedChange={handleToggleActive} />
          </div>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Filiallar</p>
            <BranchManager clinicId={clinic.id} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ClinicsPage() {
  const { data: clinics, isLoading } = useAllClinics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kompaniyalar</h1>
          <p className="text-muted-foreground text-sm">
            Barcha klinikalar va ularning filiallari
          </p>
        </div>
        <CreateClinicDialog />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !clinics || clinics.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Hozircha klinikalar yo'q"
          description="Birinchi klinikani qo'shib boshlang"
        />
      ) : (
        <div className="space-y-3">
          {clinics.map((clinic) => (
            <ClinicRow key={clinic.id} clinic={clinic} />
          ))}
        </div>
      )}
    </div>
  )
}
