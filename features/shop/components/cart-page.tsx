"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Trash2 } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { RootState } from "@/store/rootReducer"
import { useCreateOrderMutation, useListProductsQuery } from "@/features/shop/api"
import { useCart } from "@/features/shop/hooks/use-cart"
import { QuantityStepper } from "@/features/shop/components/buy-now-button"
import { formatBdtMinor } from "@/lib/format-currency"
import { orderWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp"
import { MARKETING_NAV_CLEARANCE } from "@/lib/marketing-layout"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=150&fit=crop"

export function CartPage() {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken)
  const userName = useSelector((s: RootState) => s.auth.user?.name)
  const { items, setQuantity, removeFromCart, clearCart } = useCart()
  const { data: productsData, isLoading } = useListProductsQuery({ pageSize: 100 })
  const [createOrder, { isLoading: ordering }] = useCreateOrderMutation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const productMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof productsData>["data"][number]>()
    for (const product of productsData?.data ?? []) {
      map.set(product.id, product)
    }
    return map
  }, [productsData])

  const lines = useMemo(
    () =>
      items
        .map((line) => {
          const product = productMap.get(line.productId)
          if (!product) return null
          return { ...line, product }
        })
        .filter((line): line is NonNullable<typeof line> => line !== null),
    [items, productMap],
  )

  const totalMinor = lines.reduce((sum, line) => sum + line.product.priceMinor * line.quantity, 0)

  async function handleCheckout() {
    setError(null)
    try {
      const result = await createOrder({
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      }).unwrap()

      clearCart()
      setConfirmOpen(false)
      window.location.href = whatsappUrl(
        orderWhatsAppMessage(
          result.data.id,
          result.data.items.map((item) => ({ title: item.title, quantity: item.quantity })),
          result.data.totalMinor,
          userName ?? undefined,
        ),
      )
    } catch {
      setError("Could not place order. Please try again.")
      setConfirmOpen(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className={`container mx-auto px-4 py-16 text-center ${MARKETING_NAV_CLEARANCE}`}>
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse the shop and add study materials.</p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Browse shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={`container mx-auto max-w-4xl px-4 py-10 md:py-14 ${MARKETING_NAV_CLEARANCE}`}>
      <h1 className="mb-8 text-3xl font-bold">Shopping cart</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading cart…</p>
      ) : (
        <div className="space-y-4">
          {lines.map((line) => (
            <div
              key={line.productId}
              className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-28">
                <Image
                  src={line.product.thumbnail ?? FALLBACK_IMAGE}
                  alt={line.product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <Link
                  href={`/shop/${line.product.slug || line.product.id}`}
                  className="font-medium hover:underline"
                >
                  {line.product.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatBdtMinor(line.product.priceMinor)} each
                </p>
              </div>
              <QuantityStepper
                value={line.quantity}
                onChange={(qty) => setQuantity(line.productId, qty)}
              />
              <p className="min-w-[5rem] text-right font-semibold">
                {formatBdtMinor(line.product.priceMinor * line.quantity)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeFromCart(line.productId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-col items-end gap-4 border-t pt-6">
            <p className="text-xl font-bold">Total: {formatBdtMinor(totalMinor)}</p>
            {!accessToken ? (
              <Button size="lg" asChild>
                <Link href="/login">Log in to checkout</Link>
              </Button>
            ) : (
              <Button size="lg" disabled={ordering || lines.length === 0} onClick={() => setConfirmOpen(true)}>
                Checkout
              </Button>
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm payment by WhatsApp</AlertDialogTitle>
            <AlertDialogDescription>
              After you confirm, your order will be submitted and you will be redirected to
              WhatsApp to complete payment with the admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={ordering}>Cancel</AlertDialogCancel>
            <Button disabled={ordering} onClick={() => void handleCheckout()}>
              {ordering ? "Submitting…" : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
