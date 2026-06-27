"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface TableRowAction {
  label: string
  href?: string
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
  hidden?: boolean
}

interface TableRowActionsProps {
  actions: TableRowAction[]
}

export function TableRowActions({ actions }: TableRowActionsProps) {
  const visible = actions.filter((action) => !action.hidden)
  if (visible.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visible.map((action) => {
          const itemClassName = cn(
            action.destructive && "text-destructive focus:text-destructive",
          )

          if (action.href) {
            return (
              <DropdownMenuItem key={action.label} asChild disabled={action.disabled}>
                <Link href={action.href} className={itemClassName}>
                  {action.label}
                </Link>
              </DropdownMenuItem>
            )
          }

          return (
            <DropdownMenuItem
              key={action.label}
              disabled={action.disabled}
              className={itemClassName}
              onClick={action.onClick}
            >
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
