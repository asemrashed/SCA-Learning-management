"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useListOrdersQuery } from "@/features/shop/api"
import { ProductReadModal } from "@/features/shop/components/product-read-modal"
import { ORDER_STATUS_LABEL } from "@/features/shop/utils"
import {
  formatOrderAmount,
  formatOrderDisplayId,
  orderPaymentSummary,
} from "@/features/shop/order-helpers"
import { OrderStatus } from "@/types/api"
import { StudentPageShell } from "@/components/student/student-page-shell"

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

interface ReadTarget {
  productId: string
  title: string
  priceMinor: number
}

export function StudentOrdersTable() {
  const { data, isLoading, error } = useListOrdersQuery()
  const orders = data?.data ?? []
  const [readTarget, setReadTarget] = useState<ReadTarget | null>(null)

  return (
    <StudentPageShell title="My Orders">
      <div className="mb-6 flex justify-end">
        <Button
          asChild
          className="rounded-lg bg-secondary text-primary hover:bg-secondary/90"
        >
          <Link href="/shop">View products</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders…</p>
      ) : error ? (
        <p className="text-destructive">Could not load orders.</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">You have not placed any orders yet.</p>
          <Button className="mt-4 bg-secondary text-primary hover:bg-secondary/90" asChild>
            <Link href="/shop">View products</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Read</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const { paidMinor, dueMinor } = orderPaymentSummary(order)
                  const canRead = order.status === OrderStatus.CONFIRMED && order.items[0]
                  const firstItem = order.items[0]

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{formatOrderDisplayId(order.id)}</span>
                          <Badge
                            variant={
                              order.status === OrderStatus.CONFIRMED ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {ORDER_STATUS_LABEL[order.status] ?? order.status}
                          </Badge>
                          {order.status === OrderStatus.CONFIRMED && dueMinor === 0 ? (
                            <Badge className="bg-emerald-600 text-xs hover:bg-emerald-600">
                              Paid
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
                      <TableCell>{formatOrderAmount(order.totalMinor)}</TableCell>
                      <TableCell>{formatOrderAmount(paidMinor)}</TableCell>
                      <TableCell>{formatOrderAmount(dueMinor)}</TableCell>
                      <TableCell className="text-right">
                        {canRead && firstItem ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() =>
                              setReadTarget({
                                productId: firstItem.productId,
                                title: firstItem.title,
                                priceMinor: firstItem.unitPriceMinor,
                              })
                            }
                          >
                            <BookOpen className="mr-1 h-4 w-4" />
                            Read
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          size="sm"
                          className="rounded-lg bg-primary text-secondary hover:bg-primary/90"
                        >
                          <Link href={`/dashboard/orders/${order.id}`}>
                            View
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4 md:hidden">
            {orders.map((order) => {
              const { paidMinor, dueMinor } = orderPaymentSummary(order)
              const canRead = order.status === OrderStatus.CONFIRMED && order.items[0]
              const firstItem = order.items[0]

              return (
                <div key={order.id} className="rounded-xl border p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{formatOrderDisplayId(order.id)}</span>
                    <Badge variant={order.status === OrderStatus.CONFIRMED ? "default" : "secondary"}>
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Date</dt>
                      <dd>{formatOrderDate(order.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Total</dt>
                      <dd>{formatOrderAmount(order.totalMinor)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Paid</dt>
                      <dd>{formatOrderAmount(paidMinor)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Due</dt>
                      <dd>{formatOrderAmount(dueMinor)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex gap-2">
                    {canRead && firstItem ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg"
                        onClick={() =>
                          setReadTarget({
                            productId: firstItem.productId,
                            title: firstItem.title,
                            priceMinor: firstItem.unitPriceMinor,
                          })
                        }
                      >
                        <BookOpen className="mr-1 h-4 w-4" />
                        Read
                      </Button>
                    ) : null}
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 rounded-lg bg-primary text-secondary hover:bg-primary/90"
                    >
                      <Link href={`/dashboard/orders/${order.id}`}>
                        View
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <ProductReadModal
        open={readTarget != null}
        onOpenChange={(open) => {
          if (!open) setReadTarget(null)
        }}
        productId={readTarget?.productId ?? ""}
        title={readTarget?.title ?? ""}
        priceMinor={readTarget?.priceMinor ?? 0}
        purchased
      />
    </StudentPageShell>
  )
}
