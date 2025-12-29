import { requireAdmin } from "@/lib/auth/rbac"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch admin statistics
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: totalSellers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "seller")

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { data: platformSummary } = await supabase.rpc("get_platform_summary")

  const { count: activeListings } = await supabase
    .from("platform_listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Across all sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSellers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All-time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings || 0}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformSummary && platformSummary.length > 0 ? (
              platformSummary.map((platform: any) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{platform.platform}</p>
                    <p className="text-sm text-muted-foreground">
                      {platform.active_listings} active listings • {platform.total_sales} sales
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${Number.parseFloat(platform.total_revenue || 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No platform data available yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
