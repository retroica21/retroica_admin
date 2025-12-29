"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { UserProfile } from "./rbac"

interface UseUserReturn {
  user: any | null
  profile: UserProfile | null
  isLoading: boolean
  error: Error | null
}

/**
 * Client-side hook to get current user and profile
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError

        if (authUser) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single()

          if (profileError) throw profileError

          setUser(authUser)
          setProfile(profileData as UserProfile)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch user"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, profile, isLoading, error }
}

/**
 * Client-side hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const router = useRouter()
  const { user, profile, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  return { user, profile, isLoading }
}

/**
 * Client-side hook to require admin role
 * Redirects to dashboard if not admin
 */
export function useRequireAdmin() {
  const router = useRouter()
  const { user, profile, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login")
      } else if (profile?.role !== "admin") {
        router.push("/dashboard")
      }
    }
  }, [user, profile, isLoading, router])

  return { user, profile, isLoading }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
