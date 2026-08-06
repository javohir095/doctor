export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

const LOGIN_DOMAIN = "login.dental-crm.internal"

/** Supabase Auth still requires an email under the hood; staff log in with a
 * plain alphanumeric username instead, so we derive a synthetic address that
 * is never actually emailed to anyone. Must match the Edge Functions
 * (signup-clinic / create-staff) exactly. */
export function usernameToSyntheticEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${LOGIN_DOMAIN}`
}
