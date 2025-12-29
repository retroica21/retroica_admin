import { requireAuth } from "@/lib/auth/rbac"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Plus, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function ProductsPage() {
  const { profile } = await requireAuth()
  const supabase = await createClient()

  // Fetch seller's products with platform listings
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      platform_listings (
        id,
        platform,
        status,
        price,
        platform_url,
        listed_at
      )
    `)
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching products:", error)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "sold":
        return "bg-blue-500"
      case "draft":
        return "bg-gray-500"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Products</h1>
          <p className="text-muted-foreground">Manage your inventory and platform listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first product to your inventory
            </p>
            <Button asChild>
              <Link href="/dashboard/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product: any) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{product.title}</CardTitle>
                      <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                    </div>
                    <CardDescription>
                      {product.category} • {product.condition} • SKU: {product.sku}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${product.base_price?.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Cost: ${product.cost?.toFixed(2)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  )}

                  {/* Platform Listings */}
                  {product.platform_listings && product.platform_listings.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Listed on:</h4>
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
                    <p className="text-sm text-muted-foreground">Not listed on any platform yet</p>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${product.id}`}>View Details</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${product.id}/edit`}>Edit</Link>
                    </Button>
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
