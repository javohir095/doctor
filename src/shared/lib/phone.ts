export const UZ_PHONE_REGEX = /^\+998\d{9}$/

/** Formats a stored +998XXXXXXXXX phone into "+998 XX XXX XX XX" for display. */
export function formatUzPhone(phone: string): string {
  const match = phone.match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/)
  if (!match) return phone
  const [, op, a, b, c] = match
  return `+998 ${op} ${a} ${b} ${c}`
}
