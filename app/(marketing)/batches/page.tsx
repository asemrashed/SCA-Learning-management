import { redirect } from 'next/navigation'

export default async function BatchesCatalogRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const query = new URLSearchParams({ type: 'live-batches' })
  if (params.category) {
    query.set('category', params.category)
  }
  redirect(`/courses?${query.toString()}`)
}
