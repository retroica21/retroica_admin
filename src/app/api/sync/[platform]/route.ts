import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api/response"
import { PlatformFactory } from "@/lib/platforms/factory"
import type { PlatformType } from "@/lib/api/types"

export async function POST(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  try {
    const supabase = await createClient()
    const { platform } = await params

    // Check authentication and admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") {
      return forbiddenResponse("Only admins can trigger platform sync")
    }

    // Create platform adapter
    const adapter = PlatformFactory.createAdapter(platform as PlatformType)

    // Log sync start
    const { data: syncLog } = await supabase
      .from("platform_sync_log")
      .insert({
        platform: platform as PlatformType,
        sync_type: "manual",
        status: "in-progress",
      })
      .select()
      .single()

    // Perform sync
    const result = await adapter.fullSync()

    // Update sync log
    if (syncLog) {
      await supabase
        .from("platform_sync_log")
        .update({
          status: result.success ? "success" : "failure",
          records_processed: (result.products_synced || 0) + (result.orders_synced || 0),
          error_message: result.errors?.join(", "),
          sync_completed_at: new Date().toISOString(),
        })
        .eq("id", syncLog.id)
    }

    return successResponse(result)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Sync failed")
  }
}
