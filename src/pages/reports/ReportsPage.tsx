import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns"
import { CalendarCheck, Download, ReceiptText, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { StatTile } from "@/shared/ui/StatTile"
import { DatePicker } from "@/shared/ui/DatePicker"
import { useReportsData } from "@/entities/reports/api/queries"
import type { ReportPeriod } from "@/entities/reports/model/types"
import { toDateInputValue } from "@/shared/lib/date"

function money(n: number) {
  return `${Math.round(n).toLocaleString("uz-UZ")} so'm`
}

function usePeriodRange(period: ReportPeriod, customStart: string, customEnd: string) {
  return useMemo(() => {
    const now = new Date()
    if (period === "week") {
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    }
    if (period === "custom" && customStart && customEnd) {
      return { start: new Date(`${customStart}T00:00:00`), end: new Date(`${customEnd}T23:59:59`) }
    }
    return { start: startOfMonth(now), end: endOfMonth(now) }
  }, [period, customStart, customEnd])
}

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("month")
  const [customStart, setCustomStart] = useState(toDateInputValue(startOfMonth(new Date())))
  const [customEnd, setCustomEnd] = useState(toDateInputValue(new Date()))
  const { start, end } = usePeriodRange(period, customStart, customEnd)
  const { data, isLoading } = useReportsData(start, end)

  function exportPdf() {
    if (!data) return
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Hisobot", 14, 16)
    doc.setFontSize(10)
    doc.text(
      `${format(start, "dd.MM.yyyy")} — ${format(end, "dd.MM.yyyy")}`,
      14,
      23
    )
    doc.text(`Umumiy tushum: ${money(data.revenueTotal)}`, 14, 31)
    doc.text(`Qabullar: ${data.appointmentsCompleted}/${data.appointmentsTotal}`, 14, 37)
    doc.text(`O'rtacha chek: ${money(data.avgCheck)}`, 14, 43)

    autoTable(doc, {
      startY: 50,
      head: [["Shifokor", "Qabullar", "Tushum", "O'rtacha chek", "Yuklanish"]],
      body: data.doctorStats.map((d) => [
        d.doctorName,
        String(d.appointmentsCount),
        money(d.estimatedRevenue),
        money(d.avgCheck),
        `${Math.round(d.utilizationPct)}%`,
      ]),
    })

    doc.save(`hisobot_${toDateInputValue(start)}_${toDateInputValue(end)}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Hisobotlar</h1>
          <p className="text-muted-foreground text-sm">
            {format(start, "dd.MM.yyyy")} — {format(end, "dd.MM.yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Bu oy</SelectItem>
              <SelectItem value="week">Bu hafta</SelectItem>
              <SelectItem value="custom">Maxsus oraliq</SelectItem>
            </SelectContent>
          </Select>
          {period === "custom" && (
            <>
              <DatePicker className="w-40" value={customStart} onChange={setCustomStart} />
              <DatePicker className="w-40" value={customEnd} onChange={setCustomEnd} />
            </>
          )}
          <Button variant="outline" onClick={exportPdf} disabled={!data}>
            <Download className="size-4" />
            PDF eksport
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile
              label="Davr tushumi"
              value={money(data.revenueTotal)}
              icon={Wallet}
              tone="success"
            />
            <StatTile
              label="Qabullar (bajarilgan/jami)"
              value={`${data.appointmentsCompleted}/${data.appointmentsTotal} (${Math.round(data.completionPct)}%)`}
              icon={CalendarCheck}
            />
            <StatTile label="O'rtacha chek" value={money(data.avgCheck)} icon={ReceiptText} />
          </div>

          {data.revenueChangePct !== null && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {data.revenueChangePct >= 0 ? (
                <TrendingUp className="size-4 text-success" />
              ) : (
                <TrendingDown className="size-4 text-destructive" />
              )}
              O'tgan davrga nisbatan{" "}
              <span
                className={data.revenueChangePct >= 0 ? "font-medium text-success" : "font-medium text-destructive"}
              >
                {data.revenueChangePct >= 0 ? "+" : ""}
                {Math.round(data.revenueChangePct)}%
              </span>
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kunlar bo'yicha tushum</CardTitle>
            </CardHeader>
            <CardContent>
              {data.revenueByDay.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Tanlangan davrda to'lovlar yo'q
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.revenueByDay} barSize={24}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)" }}
                      formatter={(value) => money(Number(value ?? 0))}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        color: "var(--foreground)",
                      }}
                    />
                    <Bar dataKey="amount" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shifokorlar statistikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shifokor</TableHead>
                      <TableHead>Qabullar</TableHead>
                      <TableHead>Taxminiy tushum</TableHead>
                      <TableHead>O'rtacha chek</TableHead>
                      <TableHead className="w-40">Yuklanish</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.doctorStats.map((d) => (
                      <TableRow key={d.doctorId}>
                        <TableCell className="font-medium">{d.doctorName}</TableCell>
                        <TableCell>
                          {d.completedCount}/{d.appointmentsCount}
                        </TableCell>
                        <TableCell>{money(d.estimatedRevenue)}</TableCell>
                        <TableCell>{money(d.avgCheck)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={d.utilizationPct} className="w-24" />
                            <span className="text-xs text-muted-foreground w-9 shrink-0">
                              {Math.round(d.utilizationPct)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.doctorStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Tanlangan davrda qabullar yo'q
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
