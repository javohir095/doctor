import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import type { Profile } from "@/entities/session/model/types"

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "doctor")
        .eq("is_active", true)
        .order("full_name")
      if (error) throw error
      return data as Profile[]
    },
  })
}
