import { redirect } from "next/navigation"

export default function HomePage() {
  // Just redirect to login - let middleware handle auth redirects
  redirect("/auth/login")
}
