"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, ChevronDown, Bell, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand"
import {
  BROWSE_LIVE_COURSES,
  LIVE_COURSE_CATALOG_HREF,
  LIVE_COURSES,
} from "@/lib/product-vocabulary"
import { AuthNavActions } from "@/components/auth/auth-nav-actions"
import { CartNavButton } from "@/features/shop/components/cart-nav-button"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
  { href: "/", label: "Home" },
  { href: LIVE_COURSE_CATALOG_HREF, label: LIVE_COURSES },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
]

interface NavbarProps {
  variant?: "default" | "floating"
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isFloating = variant === "floating"

  const navContent = (
    <nav
      className={cn(
        "flex h-14 items-center justify-between px-4 md:h-16 md:px-6",
        isFloating && "md:px-8"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary md:h-10 md:w-10">
          <span className="text-lg font-bold text-primary-foreground md:text-xl">{BRAND_SHORT}</span>
        </div>
        <span
          className={cn(
            "font-bold",
            isFloating
              ? "hidden text-base text-white sm:inline md:text-lg"
              : "text-base text-foreground md:text-lg"
          )}
        >
          {BRAND_NAME}
        </span>
        {isFloating && (
          <span className="text-base font-bold text-white sm:hidden">{BRAND_SHORT}</span>
        )}
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-6 lg:flex">
        {!isFloating && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search live courses..."
              className="w-56 pl-9 bg-muted/50 border-none focus-visible:ring-primary"
            />
          </div>
        )}

        <div className="flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isFloating
                  ? "text-white/80 hover:text-white"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="hidden items-center gap-2 md:flex md:gap-3">
        {!isFloating && (
          <>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Globe className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={LIVE_COURSE_CATALOG_HREF}>
                {BROWSE_LIVE_COURSES}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
        <CartNavButton floating={isFloating} />
        <AuthNavActions floating={isFloating} layout="desktop" />
      </div>

      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(isFloating ? "text-white hover:bg-white/10" : "", "lg:hidden")}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </nav>
  )

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "lg:hidden overflow-hidden z-50",
            isFloating
              ? "absolute left-0 right-0 top-full mt-2 rounded-[24px] bg-secondary border border-white/20 p-4 pb-6 shadow-xl max-h-[80vh] overflow-y-auto"
              : "bg-card border-b border-border px-4 py-6 absolute left-0 right-0 top-full shadow-lg max-h-[80vh] overflow-y-auto"
          )}
        >
          <div className="flex flex-col items-center gap-1 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex w-full max-w-xs items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isFloating
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center">
            <AuthNavActions
              floating={isFloating}
              layout="mobile"
              onNavigate={() => setIsOpen(false)}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (isFloating) {
    return (
      <div className="container relative z-[100] mx-auto w-full">
        <div className="overflow-visible rounded-full border border-white/20 bg-secondary shadow-lg">
          {navContent}
        </div>
        {dropdownContent}
      </div>
    )
  }

  return (
    <header className="relative sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container relative z-50 mx-auto">
        {navContent}
      </div>
      {dropdownContent}
    </header>
  )
}
