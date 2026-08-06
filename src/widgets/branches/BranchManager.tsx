import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"
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
  FormDescription,
} from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/shared/ui/EmptyState"
import { useBranches } from "@/entities/branches/api/queries"
import { createBranch, updateBranch, deleteBranch } from "@/entities/branches/api/mutations"
import type { Branch } from "@/entities/branches/model/types"

const branchSchema = z.object({
  name: z.string().min(2, "Filial nomini kiriting"),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
})

type BranchValues = z.infer<typeof branchSchema>

function BranchFormDialog({
  clinicId,
  branch,
  trigger,
}: {
  clinicId: string
  branch?: Branch
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<BranchValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: branch?.name ?? "",
      address: branch?.address ?? "",
      phone: branch?.phone ?? "",
      is_active: branch?.is_active ?? true,
    },
  })

  async function onSubmit(values: BranchValues) {
    try {
      const payload = {
        name: values.name,
        address: values.address || null,
        phone: values.phone || null,
        is_active: values.is_active,
      }
      if (branch) {
        await updateBranch(branch.id, payload)
      } else {
        await createBranch({ ...payload, clinic_id: clinicId })
      }
      await queryClient.invalidateQueries({ queryKey: ["branches", { clinicId }] })
      await queryClient.invalidateQueries({ queryKey: ["clinics-admin"] })
      toast.success(branch ? "Filial yangilandi" : "Filial qo'shildi")
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
          <DialogTitle>{branch ? "Filialni tahrirlash" : "Yangi filial"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filial nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Chilonzor filiali" autoComplete="off" {...field} />
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
                  <FormDescription>Ixtiyoriy</FormDescription>
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
              <Button type="submit">{branch ? "Saqlash" : "Qo'shish"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function BranchManager({ clinicId }: { clinicId: string }) {
  const { data: branches, isLoading } = useBranches(clinicId)
  const queryClient = useQueryClient()

  async function handleDelete(id: string) {
    try {
      await deleteBranch(id)
      await queryClient.invalidateQueries({ queryKey: ["branches", { clinicId }] })
      await queryClient.invalidateQueries({ queryKey: ["clinics-admin"] })
      toast.success("Filial o'chirildi")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O'chirishda xatolik")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <BranchFormDialog
          clinicId={clinicId}
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Filial qo'shish
            </Button>
          }
        />
      </div>

      <div className="rounded-lg border bg-card">
        {!branches || branches.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Hozircha filiallar yo'q"
            description="Klinikangiz uchun birinchi filialni qo'shing"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead>Manzil</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.address ?? "—"}</TableCell>
                  <TableCell>{branch.phone ?? "—"}</TableCell>
                  <TableCell>
                    {branch.is_active ? (
                      <Badge variant="secondary" className="bg-success/15 text-success-foreground border-success/30">
                        Faol
                      </Badge>
                    ) : (
                      <Badge variant="outline">Nofaol</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <BranchFormDialog
                        clinicId={clinicId}
                        branch={branch}
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
                            <AlertDialogTitle>Filialni o'chirish</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{branch.name}" filialini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(branch.id)}>
                              O'chirish
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
