import { redirect } from "next/navigation"

/** Live class/session management is hidden; keep route for old bookmarks. */
export default async function AdminBatchLivePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/batches/${id}`)
}
