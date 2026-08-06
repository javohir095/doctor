import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, UserCog } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { UZ_PHONE_REGEX, formatUzPhone } from "@/shared/lib/phone"
import { USERNAME_REGEX } from "@/shared/lib/username"
import { EmptyState } from "@/shared/ui/EmptyState"
import { useStaffList } from "@/entities/staff/api/queries"
import { createStaff } from "@/entities/session/api/mutations"
import { setStaffActive } from "@/entities/staff/api/mutations"
import { useProfile } from "@/entities/session/api/queries"
import { ROLE_LABELS, type UserRole } from "@/entities/session/model/types"

const staffSchema = z.object({
  fullName: z.string().min(2, "Ism-familiyani kiriting"),
  role: z.enum(["doctor", "admin"]),
  phone: z.string().regex(UZ_PHONE_REGEX, "Format: +998901234567").optional().or(z.literal("")),
  username: z
    .string()
    .regex(USERNAME_REGEX, "Faqat harf, raqam va pastki chiziq (3-20 belgi)"),
  password: z.string().min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak"),
})

type StaffValues = z.infer<typeof staffSchema>

const ROLE_BADGE_VARIANT: Record<UserRole, "default" | "secondary" | "outline"> = {
  superadmin: "default",
  owner: "default",
  doctor: "secondary",
  admin: "outline",
}

function AddStaffDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<StaffValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { fullName: "", role: "doctor", phone: "", username: "", password: "" },
  })

  async function onSubmit(values: StaffValues) {
    setError(null)
    setIsSubmitting(true)
    try {
      await createStaff({
        fullName: values.fullName,
        role: values.role,
        phone: values.phone || undefined,
        username: values.username,
        password: values.password,
      })
      await queryClient.invalidateQueries({ queryKey: ["staff"] })
      form.reset()
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xodim qo'shishda xatolik")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Xodim qo'shish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi xodim qo'shish</DialogTitle>
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
              name="fullName"
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="doctor">Shifokor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>Login</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="masalan: dilnoza2024"
                      autoComplete="off"
                      autoCapitalize="off"
                      {...field}
                    />
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
                    <Input type="text" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Bu parolni xodimga o'zingiz yetkazing (masalan Telegram orqali).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Qo'shilmoqda..." : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function StaffPage() {
  const { data: staff, isLoading } = useStaffList()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  async function handleToggle(userId: string, checked: boolean) {
    try {
      await setStaffActive(userId, checked)
      await queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast.success(checked ? "Xodim faollashtirildi" : "Xodim bloklandi")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik yuz berdi")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Xodimlar</h1>
          <p className="text-muted-foreground text-sm">
            Klinikangiz shifokorlari va administratorlari
          </p>
        </div>
        <AddStaffDialog />
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism-familiya</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Holat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.full_name}</TableCell>
                  <TableCell className="font-mono text-sm">{member.username}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE_VARIANT[member.role]}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.phone ? formatUzPhone(member.phone) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {member.is_active ? "Faol" : "Bloklangan"}
                      </span>
                      <Switch
                        checked={member.is_active}
                        disabled={member.id === profile?.id}
                        onCheckedChange={(checked) => handleToggle(member.id, checked)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {staff?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={UserCog}
                      title="Hozircha xodimlar yo'q"
                      description="Shifokor yoki administrator qo'shib boshlang"
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
