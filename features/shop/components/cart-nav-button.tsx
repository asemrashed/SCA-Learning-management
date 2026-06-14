"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/shop/hooks/use-cart"
import { cn } from "@/lib/utils"

interface CartNavButtonProps {
  floating?: boolean
  className?: string
}

export function CartNavButton({ floating = false, className }: CartNavButtonProps) {
  const { count } = useCart()

  return (
    <Button
      variant={floating ? "ghost" : "outline"}
      size="icon"
      className={cn(
        "relative rounded-xl",
        floating && "text-white hover:bg-white/10",
        className,
      )}
      asChild
    >
      <Link href="/shop/cart" aria-label="Shopping cart">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}
