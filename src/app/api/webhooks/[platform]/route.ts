import type { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api/response"
import { PlatformFactory } from "@/lib/platforms/factory"
import type { PlatformType } from "@/lib/api/types"

export async function POST(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  try {
    const { platform } = await params
    const body = await request.json()
    const signature = request.headers.get("x-signature") || request.headers.get("x-webhook-signature")

    // Create platform adapter
    const adapter = PlatformFactory.createAdapter(platform as PlatformType)

    // Verify webhook signature
    if (!adapter.verifyWebhook(body, signature || undefined)) {
      return errorResponse("Invalid webhook signature", 401)
    }

    // Handle webhook
    await adapter.handleWebhook(body)

    return successResponse({ received: true })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Webhook processing failed")
  }
}
