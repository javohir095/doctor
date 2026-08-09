import { format } from "date-fns"
import { ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/shared/ui/EmptyState"
import {
  TOOTH_STATUS_BADGE,
  TOOTH_STATUS_LABELS,
  type ToothRecordWithRelations,
  type ToothStatus,
} from "@/entities/teeth/model/types"

function money(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`
}

export function ToothRecordsHistory({ records }: { records: ToothRecordWithRelations[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Davolash tarixi</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Hozircha tish yozuvlari yo'q" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Tish</TableHead>
                  <TableHead>Tashxis</TableHead>
                  <TableHead>Qilingan ish</TableHead>
                  <TableHead>Shifokor</TableHead>
                  <TableHead>Narx</TableHead>
                  <TableHead>Holat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(r.record_date), "dd.MM.yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">{r.tooth_number}</TableCell>
                    <TableCell>{r.diagnosis}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.description || "—"}
                    </TableCell>
                    <TableCell>{r.doctor?.full_name ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{money(r.price)}</TableCell>
                    <TableCell>
                      <Badge variant={TOOTH_STATUS_BADGE[r.status as ToothStatus]}>
                        {TOOTH_STATUS_LABELS[r.status as ToothStatus]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
