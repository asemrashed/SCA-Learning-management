import { OrderRequestsPanel } from "@/features/shop/components/order-requests-panel"

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Shop orders</h1>
        <p className="mt-2 text-muted-foreground">
          After a student pays on WhatsApp, confirm the sale here to mark the order complete.
        </p>
      </div>
      <OrderRequestsPanel />
    </div>
  )
}
