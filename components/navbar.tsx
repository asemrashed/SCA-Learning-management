"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, ChevronDown, Bell, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
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
              placeholder="Search courses..."
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
            <Button variant="outline" className="rounded-xl">
              All Courses
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          className={cn(
            "rounded-full px-5",
            isFloating
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "rounded-xl bg-primary hover:bg-primary/90"
          )}
        >
          Login / Sign Up
        </Button>
      </div>

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className={isFloating ? "text-white" : ""}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <span className="text-lg font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search courses..." className="pl-9" />
              </div>

              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button variant="outline" className="w-full rounded-xl">
                  All Courses
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
                <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">
                  Login / Sign Up
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )

  if (isFloating) {
    return (
      <div className="container mx-auto w-full">
        <div className="rounded-full border border-white/20 bg-secondary shadow-lg">
          {navContent}
        </div>
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto">{navContent}</div>
    </header>
  )
}
