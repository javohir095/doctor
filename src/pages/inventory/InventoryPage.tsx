import { useMemo, useState } from "react"
import { AlertTriangle, Boxes, PackageX, Search, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { StatTile } from "@/shared/ui/StatTile"
import { EmptyState } from "@/shared/ui/EmptyState"
import { useInventoryItems } from "@/entities/inventory/api/queries"
import {
  INVENTORY_CATEGORIES,
  STOCK_STATUS_BADGE,
  STOCK_STATUS_LABELS,
  stockStatus,
  type StockStatus,
} from "@/entities/inventory/model/types"
import { InventoryStockInDialog } from "@/widgets/inventory/InventoryStockInDialog"

function money(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`
}

export function InventoryPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState<"all" | StockStatus>("all")
  const { data: items, isLoading } = useInventoryItems(search, category)

  const filtered = useMemo(
    () => (items ?? []).filter((item) => status === "all" || stockStatus(item) === status),
    [items, status]
  )

  const lowOrOutCount = useMemo(
    () => (items ?? []).filter((item) => stockStatus(item) !== "ok").length,
    [items]
  )
  const totalValue = useMemo(
    () => (items ?? []).reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [items]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Ombor</h1>
          <p className="text-muted-foreground text-sm">Materiallar va sarflanadigan vositalar</p>
        </div>
        <InventoryStockInDialog />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Pozitsiyalar soni" value={String(items?.length ?? 0)} icon={Boxes} />
        <StatTile
          label="Tugayotgan pozitsiyalar"
          value={String(lowOrOutCount)}
          icon={PackageX}
          tone={lowOrOutCount > 0 ? "warning" : "default"}
        />
        <StatTile label="Ombor qiymati" value={money(totalValue)} icon={Wallet} tone="success" />
      </div>

      {lowOrOutCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            {lowOrOutCount} ta pozitsiyada zaxira minimal darajadan past yoki tugagan.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Material nomi..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kategoriyalar</SelectItem>
            {INVENTORY_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha holatlar</SelectItem>
            {Object.entries(STOCK_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableHead>Nomi</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead>Qoldiq</TableHead>
                <TableHead>Minimal zaxira</TableHead>
                <TableHead>Holat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const s = stockStatus(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.min_quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STOCK_STATUS_BADGE[s]}>{STOCK_STATUS_LABELS[s]}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Boxes}
                      title="Materiallar topilmadi"
                      description="Qidiruv yoki filtrni o'zgartiring, yoki 'Kirim' orqali yangi material qo'shing"
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
