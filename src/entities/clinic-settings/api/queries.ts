import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/shared/lib/supabase"

export function useTelegramBotConnected(clinicId: string | null | undefined) {
  return useQuery({
    queryKey: ["clinic_secrets", "telegram_connected", clinicId],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from("clinic_secrets")
        .select("telegram_bot_token")
        .eq("clinic_id", clinicId!)
        .maybeSingle()
      if (error) throw error
      return !!data?.telegram_bot_token
    },
    enabled: !!clinicId,
  })
}
