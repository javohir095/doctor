import { ToothIcon } from "./ToothIcon"
import { cn } from "@/lib/utils"

export function Logo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "size-8 rounded-lg",
    md: "size-11 rounded-xl",
    lg: "size-14 rounded-2xl",
  }
  const iconSizes = {
    sm: "size-4",
    md: "size-6",
    lg: "size-7",
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-[oklch(0.58_0.13_200)] text-primary-foreground shadow-sm",
        sizes[size],
        className
      )}
    >
      <ToothIcon className={iconSizes[size]} />
    </div>
  )
}
