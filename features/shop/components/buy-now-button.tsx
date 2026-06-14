"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Minus, Plus, ShoppingCart } from "lucide-react"
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
import { useCreateOrderMutation, useListOrdersQuery } from "@/features/shop/api"
import { useCart } from "@/features/shop/hooks/use-cart"
import { orderWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp"
import { OrderStatus } from "@/types/api"

interface BuyNowButtonProps {
  productId: string
  productTitle: string
  priceMinor: number
  quantity?: number
  clearCartAfter?: boolean
  className?: string
  label?: string
}

export function BuyNowButton({
  productId,
  productTitle,
  priceMinor,
  quantity = 1,
  clearCartAfter = false,
  className,
  label = "Buy now",
}: BuyNowButtonProps) {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken)
  const userName = useSelector((s: RootState) => s.auth.user?.name)
  const [createOrder, { isLoading: ordering }] = useCreateOrderMutation()
  const { data: ordersData, isLoading: loadingOrders } = useListOrdersQuery(undefined, {
    skip: !accessToken,
  })
  const { clearCart } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const pendingOrder = useMemo(() => {
    const orders = ordersData?.data ?? []
    return (
      orders.find(
        (order) =>
          order.status === OrderStatus.PENDING &&
          order.items.some((item) => item.productId === productId),
      ) ?? null
    )
  }, [ordersData, productId])

  const isLoading = ordering || loadingOrders

  if (priceMinor <= 0) {
    return (
      <Button className={className} size="lg" disabled>
        Not for sale
      </Button>
    )
  }

  if (!accessToken) {
    return (
      <Button className={className} size="lg" asChild>
        <Link href="/login">
          {label}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    )
  }

  async function handleConfirmBuy() {
    setError(null)
    try {
      if (pendingOrder) {
        setConfirmOpen(false)
        window.location.href = whatsappUrl(
          orderWhatsAppMessage(
            pendingOrder.id,
            pendingOrder.items.map((item) => ({ title: item.title, quantity: item.quantity })),
            pendingOrder.totalMinor,
            userName ?? undefined,
          ),
        )
        return
      }

      const result = await createOrder({
        items: [{ productId, quantity }],
      }).unwrap()

      if (clearCartAfter) {
        clearCart()
      }

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

  if (pendingOrder) {
    return (
      <div>
        <Button className={className} size="lg" variant="secondary" disabled>
          <Check className="mr-2 h-5 w-5" />
          Order submitted
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete payment on WhatsApp. An admin will confirm your order.
        </p>
        <Button
          variant="link"
          className="mt-1 h-auto p-0"
          onClick={() =>
            (window.location.href = whatsappUrl(
              orderWhatsAppMessage(
                pendingOrder.id,
                pendingOrder.items.map((item) => ({ title: item.title, quantity: item.quantity })),
                pendingOrder.totalMinor,
                userName ?? undefined,
              ),
            ))
          }
        >
          Open WhatsApp again
        </Button>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>
    )
  }

  return (
    <>
      <div>
        <Button
          className={className}
          size="lg"
          disabled={isLoading}
          onClick={() => setConfirmOpen(true)}
        >
          {label}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm payment by WhatsApp</AlertDialogTitle>
            <AlertDialogDescription>
              After you confirm, your order for &ldquo;{productTitle}&rdquo; will be submitted and
              you will be redirected to WhatsApp to complete payment with the admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={ordering}>Cancel</AlertDialogCancel>
            <Button disabled={ordering} onClick={() => void handleConfirmBuy()}>
              {ordering ? "Submitting…" : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface AddToCartButtonProps {
  productId: string
  className?: string
}

export function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => {
        addToCart(productId, 1)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }}
    >
      {added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </>
      )}
    </Button>
  )
}

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function QuantityStepper({ value, onChange, max = 99 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-lg border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-[2rem] text-center text-sm font-medium">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
