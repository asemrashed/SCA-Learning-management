import { redirect } from "next/navigation"

export default async function BatchPlayerRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dashboard/courses/${id}`)
}
