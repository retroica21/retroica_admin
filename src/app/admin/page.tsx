"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Shield } from "lucide-react"
import { useUser } from "@/lib/auth/hooks"

export default function SetupPage() {
  const { user, profile } = useUser()
  const [upgrading, setUpgrading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleUpgradeToAdmin = async () => {
    setUpgrading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/upgrade", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: "Successfully upgraded to admin! Please refresh the page." })
        // Refresh after 2 seconds
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setResult({ success: false, message: data.error || "Failed to upgrade to admin" })
      }
    } catch (error) {
      setResult({ success: false, message: "An error occurred while upgrading" })
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Setup</h1>
        <p className="text-muted-foreground mt-2">Configure your admin access and system settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Upgrade to Admin
          </CardTitle>
          <CardDescription>Grant yourself administrative privileges for this account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.role === "admin" ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>You are already an admin</AlertTitle>
              <AlertDescription>This account has full administrative access to the system.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current account details:</p>
                <div className="rounded-lg border p-4 space-y-1">
                  <div className="text-sm">
                    <strong>Email:</strong> {user?.email}
                  </div>
                  <div className="text-sm">
                    <strong>Role:</strong> {profile?.role || "seller"}
                  </div>
                  <div className="text-sm">
                    <strong>User ID:</strong> {user?.id}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Admin Privileges</AlertTitle>
                <AlertDescription>
                  As an admin, you will have access to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All products across all sellers</li>
                    <li>Import and export functionality</li>
                    <li>Platform integration management</li>
                    <li>Financial reports and analytics</li>
                    <li>User management</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button onClick={handleUpgradeToAdmin} disabled={upgrading} className="w-full">
                {upgrading ? "Upgrading..." : "Upgrade to Admin"}
              </Button>
            </>
          )}

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
