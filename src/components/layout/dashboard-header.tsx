"use client"

import { useUser } from "@/lib/auth/hooks"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  const { profile } = useUser()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold">Retroica Admin</h1>
          <p className="text-sm text-muted-foreground">Manage your retro electronics inventory</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
              <Badge variant={profile?.role === "admin" ? "default" : "secondary"} className="text-xs">
                {profile?.role}
              </Badge>
            </div>
          </div>
          <Avatar>
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
