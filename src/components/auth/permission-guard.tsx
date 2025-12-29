"use client"

import type { ReactNode } from "react"
import { useUser } from "@/lib/auth/hooks"
import { hasPermission, type Permissions } from "@/lib/auth/permissions"

interface PermissionGuardProps {
  children: ReactNode
  permission: (typeof Permissions)[keyof typeof Permissions]
  fallback?: ReactNode
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { profile } = useUser()

  if (!profile || !hasPermission(profile, permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
