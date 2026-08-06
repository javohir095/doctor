import { useProfile } from "@/entities/session/api/queries"
import { BranchManager } from "@/widgets/branches/BranchManager"
import { Skeleton } from "@/components/ui/skeleton"

export function BranchesPage() {
  const { data: profile } = useProfile()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Filiallar</h1>
        <p className="text-muted-foreground text-sm">
          Klinikangizning barcha filiallari
        </p>
      </div>

      {profile?.clinic_id ? (
        <BranchManager clinicId={profile.clinic_id} />
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </div>
  )
}
