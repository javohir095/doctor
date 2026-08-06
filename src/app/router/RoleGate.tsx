import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useProfile } from "@/entities/session/api/queries"
import type { UserRole } from "@/entities/session/model/types"

export function RoleGate({
  roles,
  children,
}: {
  roles: UserRole[]
  children: ReactNode
}) {
  const { data: profile } = useProfile()

  if (profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
