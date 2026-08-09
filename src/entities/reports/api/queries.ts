import { useQuery } from "@tanstack/react-query"
import { differenceInCalendarDays, format, subDays } from "date-fns"
import { supabase } from "@/shared/lib/supabase"
import type { ReportsData } from "@/entities/reports/model/types"

interface AppointmentRow {
  doctor_id: string
  status: string
  estimated_price: number | null
  doctor: { id: string; full_name: string } | null
}

export function useReportsData(start: Date, end: Date) {
  const startIso = start.toISOString()
  const endIso = end.toISOString()

  return useQuery({
    queryKey: ["reports", startIso, endIso],
    queryFn: async (): Promise<ReportsData> => {
      const periodDays = Math.max(1, differenceInCalendarDays(end, start))
      const prevStart = subDays(start, periodDays)
      const prevEnd = start

      const [paymentsRes, prevPaymentsRes, appointmentsRes] = await Promise.all([
        supabase
          .from("payments")
          .select("amount, paid_at")
          .gte("paid_at", startIso)
          .lt("paid_at", endIso),
        supabase
          .from("payments")
          .select("amount")
          .gte("paid_at", prevStart.toISOString())
          .lt("paid_at", prevEnd.toISOString()),
        supabase
          .from("appointments")
          .select("doctor_id, status, estimated_price, doctor:users!appointments_doctor_id_fkey(id, full_name)")
          .gte("scheduled_at", startIso)
          .lt("scheduled_at", endIso),
      ])

      if (paymentsRes.error) throw paymentsRes.error
      if (prevPaymentsRes.error) throw prevPaymentsRes.error
      if (appointmentsRes.error) throw appointmentsRes.error

      const payments = paymentsRes.data ?? []
      const prevPayments = prevPaymentsRes.data ?? []
      const appointments = (appointmentsRes.data ?? []) as unknown as AppointmentRow[]

      const revenueTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0)
      const prevRevenueTotal = prevPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const revenueChangePct =
        prevRevenueTotal > 0 ? ((revenueTotal - prevRevenueTotal) / prevRevenueTotal) * 100 : null

      const revenueByDayMap = new Map<string, number>()
      for (const p of payments) {
        const day = format(new Date(p.paid_at), "dd.MM")
        revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + Number(p.amount))
      }
      const revenueByDay = Array.from(revenueByDayMap.entries()).map(([date, amount]) => ({
        date,
        amount,
      }))

      const appointmentsTotal = appointments.length
      const appointmentsCompleted = appointments.filter((a) => a.status === "completed").length
      const completionPct =
        appointmentsTotal > 0 ? (appointmentsCompleted / appointmentsTotal) * 100 : 0
      const avgCheck = payments.length > 0 ? revenueTotal / payments.length : 0

      const byDoctor = new Map<
        string,
        { doctorName: string; count: number; completed: number; revenue: number }
      >()
      for (const a of appointments) {
        if (!a.doctor_id) continue
        const entry = byDoctor.get(a.doctor_id) ?? {
          doctorName: a.doctor?.full_name ?? "—",
          count: 0,
          completed: 0,
          revenue: 0,
        }
        entry.count += 1
        if (a.status === "completed") {
          entry.completed += 1
          entry.revenue += Number(a.estimated_price ?? 0)
        }
        byDoctor.set(a.doctor_id, entry)
      }
      const doctorStats = Array.from(byDoctor.entries())
        .map(([doctorId, v]) => ({
          doctorId,
          doctorName: v.doctorName,
          appointmentsCount: v.count,
          completedCount: v.completed,
          estimatedRevenue: v.revenue,
          avgCheck: v.completed > 0 ? v.revenue / v.completed : 0,
          utilizationPct: v.count > 0 ? (v.completed / v.count) * 100 : 0,
        }))
        .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)

      return {
        revenueTotal,
        revenueChangePct,
        appointmentsTotal,
        appointmentsCompleted,
        completionPct,
        avgCheck,
        revenueByDay,
        doctorStats,
      }
    },
  })
}
