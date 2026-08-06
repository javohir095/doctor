import { format } from "date-fns"

/** Formats a Date as "yyyy-MM-dd" using LOCAL time components — safe for
 * `<input type="date">` defaultValues. Never use `date.toISOString().slice(0, 10)`
 * for this: it converts to UTC first and rolls back a day for any timezone
 * ahead of UTC (e.g. Asia/Tashkent, UTC+5) around local midnight. */
export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

const UZ_WEEKDAYS = [
  "yakshanba",
  "dushanba",
  "seshanba",
  "chorshanba",
  "payshanba",
  "juma",
  "shanba",
]

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
]

/** "6-avgust, 2026-yil, payshanba" — browsers frequently ship incomplete ICU
 * data for "uz-UZ", so `toLocaleDateString("uz-UZ", ...)` can silently
 * render broken skeletons like "2026 M08 6, Thu". Format manually instead. */
export function formatUzDateLong(date: Date): string {
  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}, ${date.getFullYear()}-yil, ${UZ_WEEKDAYS[date.getDay()]}`
}
