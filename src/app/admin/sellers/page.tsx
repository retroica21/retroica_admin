import { requireAdmin } from "@/lib/auth/rbac"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Package, DollarSign, Calendar } from "lucide-react"

export default async function AdminSellersPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch all sellers with their product counts and total values
  const { data: sellers, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      role,
      created_at,
      products:products(id, cost)
    `,
    )
    .eq("role", "seller")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sellers:", error)
  }

  // Calculate stats for each seller
  const sellersWithStats = sellers?.map((seller) => {
    const productCount = seller.products?.length || 0
    const totalValue =
      seller.products?.reduce((sum, product) => {
        return sum + (Number(product.cost) || 0)
      }, 0) || 0

    return {
      ...seller,
      productCount,
      totalValue,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sellers</h1>
        <p className="text-muted-foreground">Manage and view all registered sellers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellersWithStats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellersWithStats?.reduce((sum, s) => sum + s.productCount, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${sellersWithStats?.reduce((sum, s) => sum + s.totalValue, 0).toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Based on cost</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sellersWithStats && sellersWithStats.length > 0 ? (
          sellersWithStats.map((seller) => (
            <Card key={seller.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{seller.full_name || "No Name"}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {seller.email}
                    </div>
                  </div>
                  <Badge variant="secondary">{seller.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-3 w-3" />
                      Products
                    </div>
                    <div className="text-2xl font-bold">{seller.productCount}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Total Value
                    </div>
                    <div className="text-2xl font-bold">${seller.totalValue.toFixed(2)}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(seller.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sellers found</h3>
              <p className="text-sm text-muted-foreground text-center">Sellers will appear here once they register</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
