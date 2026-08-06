import { useNavigate } from "react-router-dom"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { ShieldAlert } from "lucide-react"
import { useSessionStore } from "@/entities/session/model/store"
import { useProfile } from "@/entities/session/api/queries"
import { logout } from "@/entities/session/api/mutations"
import { AppShell } from "@/widgets/app-shell/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function ProtectedLayout() {
  const session = useSessionStore((s) => s.session)
  const location = useLocation()
  const navigate = useNavigate()
  const { data: profile, isLoading, isError } = useProfile()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="font-medium">Kirish imkoni yo'q</p>
          <p className="text-sm text-muted-foreground">
            Profilingiz topilmadi yoki hisobingiz bloklangan bo'lishi mumkin.
            Klinika egasiga yoki administratorga murojaat qiling.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await logout()
            navigate("/login", { replace: true })
          }}
        >
          Chiqish
        </Button>
      </div>
    )
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
