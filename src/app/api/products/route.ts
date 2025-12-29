import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return unauthorizedResponse()
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    // Query products based on role
    let query = supabase.from("products").select(`
        *,
        platform_listings (
          id,
          platform,
          status,
          price,
          platform_url
        )
      `)

    // If seller, only show their products
    if (profile?.role === "seller") {
      query = query.eq("seller_id", user.id)
    }

    const { data: products, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return successResponse(products)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch products")
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Create product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        seller_id: user.id,
        title: body.title,
        description: body.description,
        category: body.category,
        condition: body.condition,
        base_price: body.base_price,
        cost: body.cost,
        sku: body.sku,
        status: body.status || "draft",
        images: body.images || [],
        metadata: body.metadata || {},
      })
      .select()
      .single()

    if (error) throw error

    return successResponse(product, "Product created successfully", 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to create product")
  }
}
