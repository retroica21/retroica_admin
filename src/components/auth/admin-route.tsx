"use client"

import type { ReactNode } from "react"
import { useRequireAdmin } from "@/lib/auth/hooks"
import { Spinner } from "@/components/ui/spinner"

interface AdminRouteProps {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isLoading } = useRequireAdmin()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return <>{children}</>
}
