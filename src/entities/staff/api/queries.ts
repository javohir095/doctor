import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { Profile } from "@/entities/session/model/types"

export function useStaffList() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) throw error
      return data as Profile[]
    },
  })
}
