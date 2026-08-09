import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  FDI_LOWER_TEETH,
  FDI_UPPER_TEETH,
  TOOTH_HEALTHY_COLOR,
  TOOTH_STATUS_COLOR,
  type ToothRecordWithRelations,
  type ToothStatus,
} from "@/entities/teeth/model/types"
import { ToothShape } from "./ToothShape"
import { ToothRecordDialog } from "./ToothRecordDialog"

function latestRecordByTooth(records: ToothRecordWithRelations[]) {
  const map = new Map<number, ToothRecordWithRelations>()
  // records arrive sorted newest-first, so the first hit per tooth wins.
  for (const record of records) {
    if (!map.has(record.tooth_number)) map.set(record.tooth_number, record)
  }
  return map
}

function toothVisual(record: ToothRecordWithRelations | undefined) {
  const status = record?.status as ToothStatus | undefined
  const color = status ? TOOTH_STATUS_COLOR[status] : TOOTH_HEALTHY_COLOR
  return { color, glow: !!status }
}

function ToothCell({
  record,
  onClick,
}: {
  record: ToothRecordWithRelations | undefined
  onClick: () => void
}) {
  const { color, glow } = toothVisual(record)
  return (
    <button
      type="button"
      onClick={onClick}
      title={record ? record.diagnosis : "Sog'lom"}
      className="flex flex-col items-center gap-1 rounded-md p-1 transition-colors hover:bg-accent"
    >
      <ToothShape color={color} glow={glow} className="size-6 sm:size-7" />
    </button>
  )
}

export function OdontogramChart({
  patientId,
  records,
}: {
  patientId: string
  records: ToothRecordWithRelations[]
}) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const latestByTooth = useMemo(() => latestRecordByTooth(records), [records])
  const toothHistory = useMemo(
    () => (selectedTooth ? records.filter((r) => r.tooth_number === selectedTooth) : []),
    [records, selectedTooth]
  )

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Legenda:</span>
          {(
            [
              ["Sog'lom", TOOTH_HEALTHY_COLOR],
              ["Kutilmoqda", TOOTH_STATUS_COLOR.planned],
              ["Davolanmoqda", TOOTH_STATUS_COLOR.in_progress],
              ["Davolangan", TOOTH_STATUS_COLOR.completed],
              ["Olib tashlangan", TOOTH_STATUS_COLOR.removed],
            ] as const
          ).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="mx-auto flex w-max flex-col items-center gap-1">
            <div className="flex">
              {FDI_UPPER_TEETH.map((tooth, i) => {
                const record = latestByTooth.get(tooth)
                const { color, glow } = toothVisual(record)
                return (
                  <div
                    key={tooth}
                    className={cn("flex flex-col items-center", i === 8 && "ml-3")}
                  >
                    <ToothCell record={record} onClick={() => setSelectedTooth(tooth)} />
                    <span
                      className={cn("text-[11px]", glow ? "font-bold" : "text-muted-foreground")}
                      style={glow ? { color } : undefined}
                    >
                      {tooth}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="my-1 h-px w-full bg-border" />
            <div className="flex">
              {FDI_LOWER_TEETH.map((tooth, i) => {
                const record = latestByTooth.get(tooth)
                const { color, glow } = toothVisual(record)
                return (
                  <div
                    key={tooth}
                    className={cn("flex flex-col-reverse items-center", i === 8 && "ml-3")}
                  >
                    <ToothCell record={record} onClick={() => setSelectedTooth(tooth)} />
                    <span
                      className={cn("text-[11px]", glow ? "font-bold" : "text-muted-foreground")}
                      style={glow ? { color } : undefined}
                    >
                      {tooth}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>

      <ToothRecordDialog
        toothNumber={selectedTooth}
        patientId={patientId}
        history={toothHistory}
        onOpenChange={(open) => !open && setSelectedTooth(null)}
      />
    </Card>
  )
}
