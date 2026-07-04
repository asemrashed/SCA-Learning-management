import { ShopAdminPanel } from "@/features/shop/components/shop-admin-panel"

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Shop orders</h1>
        <p className="text-sm text-muted-foreground">
          Confirm student shop requests, sell products manually after phone payment, or check and
          manage a student&apos;s product access.
        </p>
      </div>
      <ShopAdminPanel />
    </div>
  )
}
