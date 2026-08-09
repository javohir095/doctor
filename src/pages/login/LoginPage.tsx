import { useState, type ComponentType } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToothIcon } from "@/shared/ui/ToothIcon"
import { USERNAME_REGEX } from "@/shared/lib/username"
import { login } from "@/entities/session/api/mutations"

const loginSchema = z.object({
  username: z.string().regex(USERNAME_REGEX, "Login noto'g'ri"),
  password: z.string().min(1, "Parolni kiriting"),
})

type LoginValues = z.infer<typeof loginSchema>

const FEATURES: { icon: ComponentType<{ className?: string }>; label: string }[] = [
  { icon: Users, label: "342+ bemor kartotekasi" },
  { icon: ToothIcon, label: "32 tishli FDI odontogramma" },
  { icon: Send, label: "Telegram orqali eslatmalar" },
]

function BrandPanel() {
  return (
    <div className="relative hidden w-1/2 shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[oklch(0.4_0.16_258)] to-[oklch(0.58_0.22_258)] p-10 text-white lg:flex xl:p-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px] opacity-[0.08]"
      />
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 size-96 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 size-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <ToothIcon className="size-6" />
        </div>
        <span className="font-heading text-lg font-bold">DentIQ</span>
      </div>

      <div className="relative z-10 max-w-md space-y-6">
        <h1 className="font-heading text-4xl font-bold leading-tight">
          Klinikangizni bitta oynadan boshqaring
        </h1>
        <p className="text-white/75">
          Bemorlar, navbatlar, tish jadvali, to'lovlar va ombor — hammasi bir joyda.
        </p>
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icon className="size-4.5" />
              </span>
              <span className="text-sm text-white/90">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-white/50">© 2026 DentIQ · Toshkent</p>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="flex min-h-svh w-full bg-card">
      <BrandPanel />

      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold">Xush kelibsiz</h2>
            <p className="text-sm text-muted-foreground">Hisobingizga kiring</p>
          </div>

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
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked />
                Meni eslab qol
              </label>

              <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting ? "Kirilmoqda..." : "Kirish"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 space-y-2">
            <p className="text-sm font-medium">Qo'llab-quvvatlash</p>
            <p className="text-xs text-muted-foreground">
              Login yoki parolda muammo bo'lsa, bog'laning:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Send className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Telegram</p>
                  <p className="truncate text-xs font-medium">@javakhir_0105</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Users className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Telefon</p>
                  <p className="truncate text-xs font-medium">+998 90 962 74 77</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
