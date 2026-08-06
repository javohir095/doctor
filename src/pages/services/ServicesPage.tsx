import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Receipt } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/shared/ui/EmptyState"
import { useProfile } from "@/entities/session/api/queries"
import { useServices, type ClinicService } from "@/entities/services/api/queries"
import { createService, updateService, deleteService } from "@/entities/services/api/mutations"

const serviceSchema = z.object({
  name: z.string().min(2, "Xizmat nomini kiriting"),
  default_price: z.coerce.number().min(0, "Narx manfiy bo'lmasligi kerak"),
  is_active: z.boolean(),
})

type ServiceInput = z.input<typeof serviceSchema>
type ServiceValues = z.output<typeof serviceSchema>

function ServiceFormDialog({
  service,
  trigger,
}: {
  service?: ClinicService
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()

  const form = useForm<ServiceInput, unknown, ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? "",
      default_price: service?.default_price ?? 0,
      is_active: service?.is_active ?? true,
    },
  })

  async function onSubmit(values: ServiceValues) {
    try {
      if (service) {
        await updateService(service.id, values)
      } else {
        if (!profile) return
        await createService({ ...values, clinic_id: profile.clinic_id! })
      }
      await queryClient.invalidateQueries({ queryKey: ["clinic_services"] })
      toast.success(service ? "Xizmat yangilandi" : "Xizmat qo'shildi")
      setOpen(false)
      form.reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik yuz berdi")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Xizmatni tahrirlash" : "Yangi xizmat"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xizmat nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Tish tozalash" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="default_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narxi (so'm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="!mb-0">Faol</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{service ? "Saqlash" : "Qo'shish"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function ServicesPage() {
  const { data: services, isLoading } = useServices()
  const queryClient = useQueryClient()

  async function handleDelete(id: string) {
    try {
      await deleteService(id)
      await queryClient.invalidateQueries({ queryKey: ["clinic_services"] })
      toast.success("Xizmat o'chirildi")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O'chirishda xatolik")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Xizmatlar / Narxlar</h1>
          <p className="text-muted-foreground text-sm">
            Navbat va davolash rejasida tanlanadigan xizmatlar ro'yxati
          </p>
        </div>
        <ServiceFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Xizmat qo'shish
            </Button>
          }
        />
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
                <TableHead>Nomi</TableHead>
                <TableHead>Narxi</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.default_price.toLocaleString("uz-UZ")} so'm</TableCell>
                  <TableCell>
                    {service.is_active ? (
                      <Badge variant="secondary" className="bg-success/15 text-success-foreground border-success/30">
                        Faol
                      </Badge>
                    ) : (
                      <Badge variant="outline">Nofaol</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <ServiceFormDialog
                        service={service}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xizmatni o'chirish</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{service.name}" xizmatini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(service.id)}>
                              O'chirish
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {services?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState
                      icon={Receipt}
                      title="Hozircha xizmatlar yo'q"
                      description="Navbat va davolash rejasida tanlash uchun xizmat qo'shing"
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
