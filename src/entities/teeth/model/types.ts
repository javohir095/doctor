import type { Tables } from "@/shared/types/database"

export type ToothRecord = Tables<"tooth_records">

export interface ToothRecordWithRelations extends ToothRecord {
  doctor: { id: string; full_name: string } | null
  service: { id: string; name: string } | null
}

/** FDI (ISO 3950) numbering, grouped by quadrant in anatomical display order
 * (mirrors the patient facing the viewer): upper-right → upper-left on top,
 * lower-left → lower-right on bottom. */
export const FDI_UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const FDI_LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

export type ToothStatus = "planned" | "in_progress" | "completed" | "removed"

export const TOOTH_STATUS_LABELS: Record<ToothStatus, string> = {
  planned: "Kutilmoqda",
  in_progress: "Davolanmoqda",
  completed: "Davolangan",
  removed: "Olib tashlangan",
}

export const TOOTH_STATUS_BADGE: Record<ToothStatus, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "destructive",
  in_progress: "outline",
  completed: "secondary",
  removed: "secondary",
}

/** Hex colors for the odontogram chart, matched to TOOTH_STATUS_LABELS.
 * Kept as literal hex (not Tailwind tokens) since they fill SVG shapes. */
export const TOOTH_STATUS_COLOR: Record<ToothStatus, string> = {
  planned: "#ef4444",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  removed: "#9ca3af",
}

export const TOOTH_HEALTHY_COLOR = "#9ca3af"

export const DIAGNOSIS_OPTIONS = [
  "Kariyes",
  "Pulpit",
  "Periodontit",
  "Toj ostida kariyes",
  "Tish sinishi",
  "Parodontoz",
  "Toshlanish (zubnoy kamen)",
  "Kanal davolash kerak",
  "Olib tashlash kerak",
  "Protezlash kerak",
  "Implantatsiya kerak",
  "Oqartirish",
  "Profilaktik tozalash",
  "Sog'lom",
] as const
