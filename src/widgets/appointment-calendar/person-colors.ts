export interface PersonColor {
  bg: string
  text: string
  dot: string
  border: string
}

/** Categorical palette — one color per patient, so a patient's appointments
 * are visually traceable across the week/month at a glance (matches the
 * reference calendar design). Assignment is a deterministic hash of the
 * patient's id, so a given patient always renders in the same color
 * everywhere regardless of list order or loading state. Doctor identity is
 * handled separately by the "Barcha shifokorlar" filter, not by color. */
const PALETTE: PersonColor[] = [
  {
    bg: "bg-blue-100 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    border: "border-blue-400 dark:border-blue-600",
  },
  {
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    border: "border-emerald-400 dark:border-emerald-600",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-950/50",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    border: "border-purple-400 dark:border-purple-600",
  },
  {
    bg: "bg-orange-100 dark:bg-orange-950/50",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    border: "border-orange-400 dark:border-orange-600",
  },
  {
    bg: "bg-pink-100 dark:bg-pink-950/50",
    text: "text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
    border: "border-pink-400 dark:border-pink-600",
  },
  {
    bg: "bg-cyan-100 dark:bg-cyan-950/50",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    border: "border-cyan-400 dark:border-cyan-600",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    border: "border-amber-400 dark:border-amber-600",
  },
  {
    bg: "bg-teal-100 dark:bg-teal-950/50",
    text: "text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500",
    border: "border-teal-400 dark:border-teal-600",
  },
]

const FALLBACK: PersonColor = {
  bg: "bg-muted",
  text: "text-muted-foreground",
  dot: "bg-muted-foreground",
  border: "border-border",
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function personColor(id: string | null | undefined): PersonColor {
  if (!id) return FALLBACK
  return PALETTE[hashString(id) % PALETTE.length]
}
