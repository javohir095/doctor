import { create } from "zustand"
import type { Session } from "@supabase/supabase-js"

interface SessionState {
  session: Session | null
  isInitialized: boolean
  setSession: (session: Session | null) => void
  setInitialized: (value: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  isInitialized: false,
  setSession: (session) => set({ session }),
  setInitialized: (value) => set({ isInitialized: value }),
}))
