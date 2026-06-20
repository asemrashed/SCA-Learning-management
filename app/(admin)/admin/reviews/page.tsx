import { AdminReviewsPanel } from "@/features/review/components/admin-reviews-panel"

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Reviews</h1>
        <p className="mt-2 text-muted-foreground">
          Moderate student reviews. Approve reviews to show them on the home page, hide them, or
          delete them permanently.
        </p>
      </div>
      <AdminReviewsPanel />
    </div>
  )
}
