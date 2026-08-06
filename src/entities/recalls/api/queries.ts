import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import { toDateInputValue } from "@/shared/lib/date"
import type { Recall } from "@/entities/recalls/model/types"

export interface RecallWithPatient extends Recall {
  patient: { id: string; full_name: string; phone: string } | null
}

export function useUpcomingRecalls(daysAhead = 7) {
  return useQuery({
    queryKey: ["recalls", "upcoming", daysAhead],
    queryFn: async (): Promise<RecallWithPatient[]> => {
      const today = toDateInputValue(new Date())
      const until = toDateInputValue(new Date(Date.now() + daysAhead * 86_400_000))

      const { data, error } = await supabase
        .from("recall_schedule")
        .select("*, patient:patients(id, full_name, phone)")
        .eq("status", "pending")
        .gte("recall_date", today)
        .lte("recall_date", until)
        .order("recall_date", { ascending: true })

      if (error) throw error
      return data as unknown as RecallWithPatient[]
    },
  })
}
