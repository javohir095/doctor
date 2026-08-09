export interface DoctorReportStat {
  doctorId: string
  doctorName: string
  appointmentsCount: number
  completedCount: number
  estimatedRevenue: number
  avgCheck: number
  utilizationPct: number
}

export interface ReportsData {
  revenueTotal: number
  revenueChangePct: number | null
  appointmentsTotal: number
  appointmentsCompleted: number
  completionPct: number
  avgCheck: number
  revenueByDay: { date: string; amount: number }[]
  doctorStats: DoctorReportStat[]
}

export type ReportPeriod = "month" | "week" | "custom"
