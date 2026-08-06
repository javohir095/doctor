import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Bot, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProfile } from "@/entities/session/api/queries"
import { useTelegramBotConnected } from "@/entities/clinic-settings/api/queries"
import { saveTelegramBotToken } from "@/entities/clinic-settings/api/mutations"

const tokenSchema = z.object({
  botToken: z.string().min(20, "Token noto'g'ri ko'rinadi"),
})

type TokenValues = z.infer<typeof tokenSchema>

export function BotSettingsPage() {
  const { data: profile } = useProfile()
  const { data: isConnected, isLoading } = useTelegramBotConnected(profile?.clinic_id)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<TokenValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { botToken: "" },
  })

  async function onSubmit(values: TokenValues) {
    setError(null)
    try {
      const result = await saveTelegramBotToken(values.botToken)
      await queryClient.invalidateQueries({ queryKey: ["clinic_secrets"] })
      toast.success(
        result?.botUsername ? `Bot ulandi: @${result.botUsername}` : "Bot ulandi"
      )
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi")
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold">Telegram bot</h1>
        <p className="text-muted-foreground text-sm">
          Bemorlarga eslatma va qayta chaqiruv xabarlarini yuborish uchun bot
          ulang
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">Bot holati</CardTitle>
            <CardDescription>
              {isLoading
                ? "Tekshirilmoqda..."
                : isConnected
                  ? "Bot ulangan"
                  : "Bot ulanmagan"}
            </CardDescription>
          </div>
          {isConnected && <CheckCircle2 className="ml-auto size-5 text-success" />}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isConnected ? "Bot tokenini yangilash" : "Bot qo'shish"}
          </CardTitle>
          <CardDescription>
            @BotFather orqali bot yarating va tokenni shu yerga joylashtiring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="botToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot tokeni</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789:AAExampleTokenFromBotFather"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Telegram'da @BotFather ga /newbot yuboring va olingan
                      tokenni bu yerga kiriting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Saqlash va ulash
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
