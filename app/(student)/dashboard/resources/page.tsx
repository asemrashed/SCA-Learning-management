import { redirect } from "next/navigation"

export default function StudentResourcesRedirectPage() {
  redirect("/dashboard/courses")
}
