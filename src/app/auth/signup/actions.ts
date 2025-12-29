"use server"

import { createClient } from "@supabase/supabase-js"

export async function createUserProfile(userId: string, email: string, fullName: string) {
  console.log("[v0] Server action: Creating profile for user:", userId, email, fullName)

  // Create service role client that bypasses RLS
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: "seller",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Server action: Profile creation failed:", error)
      throw error
    }

    console.log("[v0] Server action: Profile created successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Server action: Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create profile",
    }
  }
}
