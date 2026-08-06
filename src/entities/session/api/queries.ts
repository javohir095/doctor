import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"
import { useSessionStore } from "@/entities/session/model/store"
import type { Profile, Clinic } from "@/entities/session/model/types"

export function useProfile() {
  const userId = useSessionStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId!)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  })
}

export function useClinic(clinicId: string | null | undefined) {
  return useQuery({
    queryKey: ["clinic", clinicId],
    queryFn: async (): Promise<Clinic> => {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", clinicId!)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!clinicId,
    staleTime: 5 * 60_000,
  })
}
