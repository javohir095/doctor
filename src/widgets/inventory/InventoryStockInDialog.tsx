import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { PackagePlus } from "lucide-react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { useProfile } from "@/entities/session/api/queries"
import { useInventoryItems } from "@/entities/inventory/api/queries"
import { createInventoryItem, addInventoryTransaction } from "@/entities/inventory/api/mutations"
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from "@/entities/inventory/model/types"

const NEW_ITEM_VALUE = "__new__"

const schema = z.object({
  itemId: z.string().min(1, "Materialni tanlang"),
  quantity: z.coerce.number().positive("Miqdor noldan katta bo'lishi kerak"),
  note: z.string().optional(),
  newName: z.string().optional(),
  newCategory: z.string().optional(),
  newUnit: z.string().optional(),
  newMinQuantity: z.coerce.number().min(0).optional(),
  newUnitPrice: z.coerce.number().min(0).optional(),
})

type Input_ = z.input<typeof schema>
type Values = z.output<typeof schema>

export function InventoryStockInDialog() {
  const [open, setOpen] = useState(false)
  const { data: profile } = useProfile()
  const { data: items } = useInventoryItems("", "all")
  const queryClient = useQueryClient()

  const form = useForm<Input_, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemId: "",
      quantity: 1,
      note: "",
      newName: "",
      newCategory: INVENTORY_CATEGORIES[0],
      newUnit: INVENTORY_UNITS[0],
      newMinQuantity: 0,
      newUnitPrice: 0,
    },
  })

  const isNewItem = form.watch("itemId") === NEW_ITEM_VALUE

  async function onSubmit(values: Values) {
    if (!profile) return
    try {
      let itemId = values.itemId
      if (isNewItem) {
        if (!values.newName?.trim()) {
          form.setError("newName", { message: "Material nomini kiriting" })
          return
        }
        const created = await createInventoryItem({
          clinic_id: profile.clinic_id!,
          name: values.newName,
          category: values.newCategory || INVENTORY_CATEGORIES[0],
          unit: values.newUnit || INVENTORY_UNITS[0],
          min_quantity: values.newMinQuantity ?? 0,
          unit_price: values.newUnitPrice ?? 0,
        })
        itemId = created.id
      }

      await addInventoryTransaction({
        clinic_id: profile.clinic_id!,
        item_id: itemId,
        type: "in",
        quantity: values.quantity,
        note: values.note || null,
        created_by: profile.id,
      })

      await queryClient.invalidateQueries({ queryKey: ["inventory_items"] })
      toast.success("Kirim qo'shildi")
      setOpen(false)
      form.reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kirimni saqlashda xatolik")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PackagePlus className="size-4" />
          Kirim
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ombor kirimi</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Materialni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NEW_ITEM_VALUE}>+ Yangi material</SelectItem>
                      {items?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isNewItem && (
              <div className="space-y-4 rounded-lg border p-3">
                <FormField
                  control={form.control}
                  name="newName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomi</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="newCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoriya</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INVENTORY_CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>O'lchov birligi</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INVENTORY_UNITS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="newMinQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimal zaxira</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={(field.value as number | string | undefined) ?? ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newUnitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birlik narxi (so'm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={(field.value as number | string | undefined) ?? ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <Separator />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kirim miqdori</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      {...field}
                      value={(field.value as number | string | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: yetkazib beruvchi nomi" {...field} />
                  </FormControl>
                  <FormDescription>Ixtiyoriy</FormDescription>
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
