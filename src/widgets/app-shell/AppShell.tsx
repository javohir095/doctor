import { useState, type ReactNode } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, LogOut, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useTheme } from "@/shared/lib/theme"
import { Logo } from "@/shared/ui/Logo"
import { useProfile, useClinic } from "@/entities/session/api/queries"
import { logout } from "@/entities/session/api/mutations"
import { ROLE_LABELS } from "@/entities/session/model/types"
import { NAV_ITEMS } from "./nav-items"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

function BrandHeader({ clinicName }: { clinicName: string }) {
  return (
    <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
      <Logo size="sm" />
      <span className="font-heading text-lg font-bold truncate leading-tight">{clinicName}</span>
    </div>
  )
}

function NavLinks({
  role,
  layoutId,
  onNavigate,
}: {
  role: string
  layoutId: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.filter((item) => item.roles.includes(role as never)).map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={onNavigate}>
          {({ isActive }) => (
            <span
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-lg bg-sidebar-accent shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 size-[18px]" />
              <span className="relative z-10">{item.label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { data: profile } = useProfile()
  const { data: clinic } = useClinic(profile?.clinic_id)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate("/login", { replace: true })
  }

  const clinicName =
    profile?.role === "superadmin" ? "Superadmin panel" : clinic?.name ?? "Tish Klinika CRM"

  return (
    <div className="min-h-svh flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-sidebar text-sidebar-foreground">
        <BrandHeader clinicName={clinicName} />
        <div className="flex-1 overflow-y-auto p-3">
          {profile && <NavLinks role={profile.role} layoutId="nav-active-desktop" />}
        </div>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-sidebar-foreground/60">
            <span className="size-1.5 rounded-full bg-success" />
            Tizim faol
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-16 items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-20">
          {/* Mobile nav trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
              <SheetTitle className="sr-only">Navigatsiya</SheetTitle>
              <BrandHeader clinicName={clinicName} />
              <div className="p-3">
                {profile && (
                  <NavLinks
                    role={profile.role}
                    layoutId="nav-active-mobile"
                    onNavigate={() => setMobileOpen(false)}
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>

          <span className="md:hidden font-semibold truncate">{clinicName}</span>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Mavzuni almashtirish">
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-7 ring-2 ring-primary/20">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {profile ? initials(profile.full_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {profile?.full_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{profile?.full_name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {profile ? ROLE_LABELS[profile.role] : ""}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="size-4" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
