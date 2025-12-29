"use client"

import type { ReactNode } from "react"
import { useRequireAuth } from "@/lib/auth/hooks"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return <>{children}</>
}
