import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import { toDateInputValue } from "@/shared/lib/date"

function todayRangeIso() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { startIso: start.toISOString(), endIso: end.toISOString() }
}

export function useTodayRevenue() {
  const { startIso, endIso } = todayRangeIso()
  return useQuery({
    queryKey: ["dashboard", "today_revenue", startIso],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from("payments")
        .select("amount")
        .gte("paid_at", startIso)
        .lt("paid_at", endIso)
      if (error) throw error
      return (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
    },
  })
}

export function useActivePatientsCount() {
  return useQuery({
    queryKey: ["dashboard", "patients_count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
      if (error) throw error
      return count ?? 0
    },
  })
}

export function useUpcomingRecallsCount(daysAhead = 7) {
  return useQuery({
    queryKey: ["dashboard", "upcoming_recalls_count", daysAhead],
    queryFn: async (): Promise<number> => {
      const today = toDateInputValue(new Date())
      const until = toDateInputValue(new Date(Date.now() + daysAhead * 86_400_000))
      const { count, error } = await supabase
        .from("recall_schedule")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("recall_date", today)
        .lte("recall_date", until)
      if (error) throw error
      return count ?? 0
    },
  })
}
