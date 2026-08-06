import { useEffect, type ReactNode } from "react"
import { supabase } from "@/shared/lib/supabase"
import { useSessionStore } from "@/entities/session/model/store"

export function SessionProvider({ children }: { children: ReactNode }) {
  const setSession = useSessionStore((s) => s.setSession)
  const setInitialized = useSessionStore((s) => s.setInitialized)
  const isInitialized = useSessionStore((s) => s.isInitialized)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitialized(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.subscription.unsubscribe()
  }, [setSession, setInitialized])

  if (!isInitialized) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground text-sm">
        Yuklanmoqda...
      </div>
    )
  }

  return children
}
