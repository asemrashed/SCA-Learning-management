import { OrderRequestsPanel } from "@/features/shop/components/order-requests-panel"

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Shop orders</h1>
        <p className="text-sm text-muted-foreground">
          After a student pays on WhatsApp, confirm the sale here to mark the order complete.
        </p>
      </div>
      <OrderRequestsPanel />
    </div>
  )
}
