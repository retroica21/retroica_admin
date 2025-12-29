"use client"

import { requireAdmin } from "@/lib/auth/rbac"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ExternalLink } from "lucide-react"
import { ProductFilters } from "@/components/admin/product-filters"

export const dynamic = "force-dynamic"

interface SearchParams {
  brand?: string
  model?: string
  category?: string
  owner?: string
  dateFrom?: string
  dateTo?: string
  status?: string
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  await requireAdmin()
  const supabase = await createClient()

  // Build query with filters
  let query = supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey (
        id,
        full_name,
        email
      ),
      platform_listings (
        id,
        platform,
        status,
        price,
        platform_url,
        listed_at
      )
    `)
    .order("created_at", { ascending: false })

  if (params.status) {
    query = query.eq("status", params.status)
  }

  const { data: products, error } = await query

  if (error) {
    console.error("[v0] Error fetching products:", error)
  }

  // Client-side filtering for metadata fields (brand, model, category)
  let filteredProducts = products || []

  if (params.brand) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.metadata?.brand?.toLowerCase().includes(params.brand!.toLowerCase()),
    )
  }

  if (params.model) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.metadata?.model?.toLowerCase().includes(params.model!.toLowerCase()),
    )
  }

  if (params.category) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.category?.toLowerCase().includes(params.category!.toLowerCase()),
    )
  }

  if (params.owner) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.profiles?.full_name?.toLowerCase().includes(params.owner!.toLowerCase()),
    )
  }

  if (params.dateFrom) {
    filteredProducts = filteredProducts.filter((p: any) => new Date(p.created_at) >= new Date(params.dateFrom!))
  }

  if (params.dateTo) {
    filteredProducts = filteredProducts.filter((p: any) => new Date(p.created_at) <= new Date(params.dateTo!))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "sold":
        return "bg-blue-500"
      case "draft":
        return "bg-gray-500"
      case "archived":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case "etsy":
        return "bg-orange-500 hover:bg-orange-600"
      case "ebay":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "poshmark":
        return "bg-purple-500 hover:bg-purple-600"
      case "mercari":
        return "bg-blue-500 hover:bg-blue-600"
      case "grailed":
        return "bg-gray-700 hover:bg-gray-800"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-muted-foreground">View and filter all products across all sellers</p>
      </div>

      <ProductFilters />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products?.length || 0} products
        </p>
      </div>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground">
              {params.brand || params.model || params.category || params.owner
                ? "Try adjusting your filters"
                : "No products have been imported yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product: any) => (
            <Card key={product.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{product.title}</h3>
                      <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {product.metadata?.brand && (
                        <div>
                          <span className="text-muted-foreground">Brand:</span>{" "}
                          <span className="font-medium">{product.metadata.brand}</span>
                        </div>
                      )}
                      {product.metadata?.model && (
                        <div>
                          <span className="text-muted-foreground">Model:</span>{" "}
                          <span className="font-medium">{product.metadata.model}</span>
                        </div>
                      )}
                      {product.category && (
                        <div>
                          <span className="text-muted-foreground">Category:</span>{" "}
                          <span className="font-medium">{product.category}</span>
                        </div>
                      )}
                      {product.condition && (
                        <div>
                          <span className="text-muted-foreground">Condition:</span>{" "}
                          <span className="font-medium">{product.condition}</span>
                        </div>
                      )}
                      {product.profiles?.full_name && (
                        <div>
                          <span className="text-muted-foreground">Owner:</span>{" "}
                          <span className="font-medium">{product.profiles.full_name}</span>
                        </div>
                      )}
                      {product.sku && (
                        <div>
                          <span className="text-muted-foreground">SKU:</span>{" "}
                          <span className="font-medium">{product.sku}</span>
                        </div>
                      )}
                      {product.metadata?.date_of_purchase && (
                        <div>
                          <span className="text-muted-foreground">Purchased:</span>{" "}
                          <span className="font-medium">
                            {new Date(product.metadata.date_of_purchase).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Added:</span>{" "}
                        <span className="font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    )}

                    {product.platform_listings && product.platform_listings.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Platform Listings:</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.platform_listings.map((listing: any) => (
                            <Badge
                              key={listing.id}
                              variant="secondary"
                              className={getPlatformBadgeColor(listing.platform)}
                            >
                              <span className="capitalize">{listing.platform}</span>
                              <span className="mx-1">•</span>
                              <span>${listing.price?.toFixed(2)}</span>
                              {listing.platform_url && (
                                <a
                                  href={listing.platform_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3 w-3 inline" />
                                </a>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not listed on any platform</p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold">${product.base_price?.toFixed(2)}</div>
                    {product.cost && (
                      <div className="text-sm text-muted-foreground">Cost: ${product.cost.toFixed(2)}</div>
                    )}
                    {product.cost && (
                      <div className="text-sm font-medium text-green-600">
                        Profit: ${(product.base_price - product.cost).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
