import { redirect } from "next/navigation"

export default function SuperAdminNewBatchRedirect() {
  redirect("/admin/batches/new")
}
