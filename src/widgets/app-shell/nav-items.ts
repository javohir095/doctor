import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserCog,
  Receipt,
  Bot,
  Building2,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/entities/session/model/types"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Kompaniyalar",
    icon: Building2,
    roles: ["superadmin"],
  },
  {
    to: "/superadmin/staff",
    label: "Xodimlar",
    icon: UserCog,
    roles: ["superadmin"],
  },
  {
    to: "/",
    label: "Bosh sahifa",
    icon: LayoutDashboard,
    roles: ["owner", "doctor", "admin"],
  },
  {
    to: "/patients",
    label: "Bemorlar",
    icon: Users,
    roles: ["owner", "doctor", "admin"],
  },
  {
    to: "/appointments",
    label: "Navbatlar",
    icon: CalendarDays,
    roles: ["owner", "doctor", "admin"],
  },
  {
    to: "/services",
    label: "Xizmatlar / Narxlar",
    icon: Receipt,
    roles: ["owner"],
  },
  {
    to: "/branches",
    label: "Filiallar",
    icon: Building2,
    roles: ["owner"],
  },
  {
    to: "/staff",
    label: "Xodimlar",
    icon: UserCog,
    roles: ["owner"],
  },
  {
    to: "/settings/bot",
    label: "Telegram bot",
    icon: Bot,
    roles: ["owner"],
  },
]
