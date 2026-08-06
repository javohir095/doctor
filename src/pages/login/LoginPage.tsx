import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
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
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/shared/ui/Logo"
import { AuthBackground } from "@/shared/ui/AuthBackground"
import { USERNAME_REGEX } from "@/shared/lib/username"
import { login } from "@/entities/session/api/mutations"

const loginSchema = z.object({
  username: z.string().regex(USERNAME_REGEX, "Login noto'g'ri"),
  password: z.string().min(1, "Parolni kiriting"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setError(null)
    setIsSubmitting(true)
    try {
      await login(values.username, values.password)
      const from = (location.state as { from?: string })?.from ?? "/"
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kirishda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthBackground>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card className="border-border/60 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/95">
          <CardHeader className="flex flex-col items-center gap-3 text-center">
            <Logo size="lg" />
            <div>
              <CardTitle className="text-xl">Tish Klinika CRM</CardTitle>
              <CardDescription className="mt-1">Hisobingizga kiring</CardDescription>
            </div>
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login</FormLabel>
                      <FormControl>
                        <Input autoComplete="username" autoCapitalize="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parol</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Kirilmoqda..." : "Kirish"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </AuthBackground>
  )
}
