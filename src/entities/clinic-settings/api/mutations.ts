import { supabase } from "@/shared/lib/supabase"

export async function saveTelegramBotToken(botToken: string) {
  const { data, error } = await supabase.functions.invoke<{
    success?: true
    botUsername?: string
    error?: string
  }>("telegram-set-webhook", { body: { botToken } })

  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}
