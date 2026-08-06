import type { Tables } from "@/shared/types/database"

export type UserRole = "superadmin" | "owner" | "doctor" | "admin"

export type Profile = Tables<"users"> & {
  role: UserRole
}

export type Clinic = Tables<"clinics">

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: "Superadmin",
  owner: "Klinika Egasi",
  doctor: "Shifokor",
  admin: "Administrator",
}
