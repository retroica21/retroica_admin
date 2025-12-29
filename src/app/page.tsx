import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/rbac"

export default async function HomePage() {
  const userData = await getCurrentUser()

  if (userData) {
    // Redirect based on role
    if (userData.profile.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  }

  // Not authenticated, redirect to login
  redirect("/auth/login")
}
