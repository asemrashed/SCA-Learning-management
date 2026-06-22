/** Parent route for staff dashboard back navigation. */
export function getStaffBackHref(pathname: string): string | null {
  if (pathname === "/admin" || pathname === "/super-admin") return null

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length <= 1) return null

  if (segments.length === 2) {
    if (segments[0] === "admin") return "/admin"
    if (segments[0] === "super-admin") return "/super-admin"
  }

  return `/${segments.slice(0, -1).join("/")}`
}

export function getStaffBackLabel(pathname: string): string {
  const backHref = getStaffBackHref(pathname)
  if (!backHref) return "Back"

  const segments = backHref.split("/").filter(Boolean)
  const last = segments[segments.length - 1]

  switch (last) {
    case "admin":
      return "Overview"
    case "super-admin":
      return "Overview"
    case "courses":
      return "Courses"
    case "categories":
      return "Categories"
    case "batches":
      return "Batches"
    case "products":
      return "Shop products"
    case "orders":
      return "Shop orders"
    case "enrollments":
      return "Enrollments"
    case "payments":
      return "Payments"
    case "resources":
      return "Resources"
    case "exams":
      return "Exams"
    case "assignments":
      return "Assignments"
    case "questions":
      return "Question bank"
    case "reviews":
      return "Reviews"
    case "users":
      return "Admins"
    case "submissions":
      return "Submissions"
    case "results":
      return "Results"
    case "all":
      return "All"
    case "live":
      return "Batch"
    case "new":
      return "List"
    case "edit":
      return "Detail"
    default:
      if (segments.includes("courses") && segments.length >= 3) return "Course"
      if (segments.includes("batches") && segments.length >= 3) return "Batch"
      if (segments.includes("products") && segments.length >= 3) return "Product"
      return "Back"
  }
}
