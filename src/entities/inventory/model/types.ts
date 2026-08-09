import type { Tables } from "@/shared/types/database"

export type InventoryItem = Tables<"inventory_items">
export type InventoryTransaction = Tables<"inventory_transactions">

export type StockStatus = "ok" | "low" | "none"

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  ok: "В норме",
  low: "Мало",
  none: "Нет",
}

export const STOCK_STATUS_BADGE: Record<StockStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ok: "secondary",
  low: "outline",
  none: "destructive",
}

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.quantity <= 0) return "none"
  if (item.quantity <= item.min_quantity) return "low"
  return "ok"
}

export const INVENTORY_CATEGORIES = [
  "Sarflanadigan materiallar",
  "Asboblar",
  "Anestetiklar",
  "Ximiya moddalari",
  "Himoya vositalari",
  "Boshqa",
] as const

export const INVENTORY_UNITS = ["dona", "quti", "o'ram", "litr", "ml", "kg", "gramm"] as const
