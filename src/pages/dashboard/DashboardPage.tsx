import { useProfile } from "@/entities/session/api/queries"
import { ClinicDashboard } from "@/widgets/dashboard/ClinicDashboard"
import { DoctorDashboard } from "@/widgets/dashboard/DoctorDashboard"
import { ClinicsPage } from "@/pages/superadmin/ClinicsPage"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUzDateLong } from "@/shared/lib/date"

export function DashboardPage() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (profile.role === "superadmin") {
    return <ClinicsPage />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Xush kelibsiz, {profile.full_name}</h1>
        <p className="text-muted-foreground text-sm">{formatUzDateLong(new Date())}</p>
      </div>

      {profile.role === "doctor" ? (
        <DoctorDashboard doctorId={profile.id} />
      ) : (
        <ClinicDashboard canSeeRevenue={profile.role === "owner" || profile.role === "admin"} />
      )}
    </div>
  )
}
