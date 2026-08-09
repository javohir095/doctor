import { Skeleton } from "@/components/ui/skeleton"
import { usePatientToothRecords } from "@/entities/teeth/api/queries"
import { OdontogramChart } from "./OdontogramChart"
import { ToothRecordsHistory } from "./ToothRecordsHistory"

export function PatientOdontogramTab({ patientId }: { patientId: string }) {
  const { data: records, isLoading } = usePatientToothRecords(patientId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <OdontogramChart patientId={patientId} records={records ?? []} />
      <ToothRecordsHistory records={records ?? []} />
    </div>
  )
}
