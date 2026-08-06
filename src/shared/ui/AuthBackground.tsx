import type { ReactNode } from "react"

/** Soft blue/teal gradient wash behind auth screens — keeps the "toza,
 * professional, tibbiy-ishonchli" (clean, professional, clinically
 * trustworthy) brief without resorting to a stock photo. */
export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh flex items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 size-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 size-96 rounded-full bg-[oklch(0.58_0.13_200)]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:32px_32px] opacity-[0.35]"
      />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  )
}
