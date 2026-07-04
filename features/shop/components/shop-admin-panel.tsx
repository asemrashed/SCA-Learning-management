"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CheckProductAccessPanel } from "@/features/shop/components/check-product-access-panel"
import { ManualProductAccessDialog } from "@/features/shop/components/manual-product-access-dialog"
import { OrderRequestsPanel } from "@/features/shop/components/order-requests-panel"

type ShopAdminView = "orders" | "access"

export function ShopAdminPanel() {
  const [view, setView] = useState<ShopAdminView>("orders")
  const [manualOpen, setManualOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value === "orders" || value === "access") setView(value)
          }}
          variant="outline"
          className="justify-start"
        >
          <ToggleGroupItem value="orders" aria-label="Order requests">
            Order requests
          </ToggleGroupItem>
          <ToggleGroupItem value="access" aria-label="Check access">
            Check access
          </ToggleGroupItem>
        </ToggleGroup>

        {view === "orders" ? (
          <Button type="button" onClick={() => setManualOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Give access
          </Button>
        ) : null}
      </div>

      {view === "orders" ? <OrderRequestsPanel /> : <CheckProductAccessPanel />}

      <ManualProductAccessDialog open={manualOpen} onOpenChange={setManualOpen} />
    </div>
  )
}
