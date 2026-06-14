import { redirect } from "next/navigation"

export default async function SuperAdminBatchLiveRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/batches/${id}/live`)
}
