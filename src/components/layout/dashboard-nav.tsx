"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/hooks"
import { useRouter } from "next/navigation"
import {
  Package,
  ShoppingCart,
  DollarSign,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Upload,
  Shield,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: any
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Financials",
    href: "/dashboard/financials",
    icon: DollarSign,
  },
]

const adminNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "All Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "All Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Sellers",
    href: "/admin/sellers",
    icon: Users,
  },
  {
    title: "Import",
    href: "/admin/import",
    icon: Upload,
  },
  {
    title: "Setup",
    href: "/admin/setup",
    icon: Shield,
  },
  {
    title: "Platform Sync",
    href: "/admin/sync",
    icon: Settings,
  },
]

interface DashboardNavProps {
  isAdmin?: boolean
}

export function DashboardNav({ isAdmin = false }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const items = isAdmin ? adminNavItems : navItems

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-secondary")}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        )
      })}

      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
