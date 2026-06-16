/** Parent route for student dashboard back navigation. */
export function getStudentBackHref(pathname: string): string | null {
  if (pathname === "/dashboard") return null

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length <= 1) return null

  if (segments.length === 2) return "/dashboard"

  return `/${segments.slice(0, -1).join("/")}`
}

export function getStudentBackLabel(pathname: string): string {
  const backHref = getStudentBackHref(pathname)
  if (!backHref) return "Back"

  const segments = backHref.split("/").filter(Boolean)
  const last = segments[segments.length - 1]

  switch (last) {
    case "dashboard":
      return "Dashboard"
    case "orders":
      return "My Orders"
    case "courses":
      return "My Courses"
    case "profile":
      return "My Profile"
    case "resources":
      return "Resources"
    case "certificates":
      return "Certificates"
    default:
      if (segments.includes("courses") && segments.length >= 3) return "Course"
      return "Back"
  }
}
