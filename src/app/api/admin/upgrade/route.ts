import { createServerClient } from "@/lib/supabase/server"
import { apiResponse } from "@/lib/api/response"

export async function POST() {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return apiResponse.error("Not authenticated", 401)
    }

    // Update user's role to admin
    const { error: updateError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)

    if (updateError) {
      console.error("[v0] Error upgrading to admin:", updateError)
      return apiResponse.error("Failed to upgrade to admin", 500)
    }

    return apiResponse.success("Successfully upgraded to admin")
  } catch (error) {
    console.error("[v0] Admin upgrade error:", error)
    return apiResponse.error("An error occurred", 500)
  }
}
