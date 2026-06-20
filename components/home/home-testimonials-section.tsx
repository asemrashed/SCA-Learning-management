import type { ReviewPublicItem } from "@/types/api"
import { TestimonialsSection } from "@/components/home/testimonials-section"

async function fetchApprovedReviews(): Promise<ReviewPublicItem[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
  const res = await fetch(`${base}/reviews?pageSize=20`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const json = (await res.json()) as { data: ReviewPublicItem[] }
  return json.data ?? []
}

export async function HomeTestimonialsSection() {
  const reviews = await fetchApprovedReviews()
  if (reviews.length === 0) return null
  return <TestimonialsSection reviews={reviews} />
}
