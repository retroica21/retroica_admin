import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type UserRole = "admin" | "seller"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

/**
 * Get the current authenticated user and their profile
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  console.log("[v0] getCurrentUser - Fetching auth user...")
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("[v0] getCurrentUser - User:", user?.email, "Error:", authError?.message)

  if (authError || !user) {
    console.log("[v0] getCurrentUser - No user found, returning null")
    return null
  }

  console.log("[v0] getCurrentUser - Fetching profile for user:", user.id)
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  console.log("[v0] getCurrentUser - Profile:", profile?.email, "Error:", profileError?.message)

  if (profileError || !profile) {
    console.log("[v0] getCurrentUser - No profile found, returning null")
    return null
  }

  console.log("[v0] getCurrentUser - Success! Role:", profile.role)
  return {
    user,
    profile: profile as UserProfile,
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const userData = await getCurrentUser()

  if (!userData) {
    redirect("/auth/login")
  }

  return userData
}

/**
 * Require admin role - redirects to login or dashboard if not admin
 */
export async function requireAdmin() {
  const userData = await requireAuth()

  if (userData.profile.role !== "admin") {
    redirect("/dashboard")
  }

  return userData
}

/**
 * Require seller role (admin or seller)
 */
export async function requireSeller() {
  const userData = await requireAuth()

  if (userData.profile.role !== "seller" && userData.profile.role !== "admin") {
    redirect("/auth/login")
  }

  return userData
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userData = await getCurrentUser()
  return userData?.profile.role === role
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin")
}

/**
 * Check if user is seller
 */
export async function isSeller(): Promise<boolean> {
  return hasRole("seller")
}
