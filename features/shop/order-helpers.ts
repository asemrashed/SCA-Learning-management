import { OrderStatus } from '@/types/api'

/** Temporary display id until sequential SCAON numbers are added server-side. */
export function formatOrderDisplayId(orderId: string): string {
  const numeric = orderId.replace(/\D/g, '').slice(-7).padStart(7, '0')
  return `SCAON-${numeric}`
}

export function orderPaymentSummary(order: { status: OrderStatus; totalMinor: number }) {
  if (order.status === OrderStatus.CONFIRMED) {
    return { paidMinor: order.totalMinor, dueMinor: 0 }
  }
  if (order.status === OrderStatus.CANCELLED) {
    return { paidMinor: 0, dueMinor: 0 }
  }
  return { paidMinor: 0, dueMinor: order.totalMinor }
}

/** Format poisha as decimal taka string (e.g. 4080.00) for order tables. */
export function formatOrderAmount(minor: number): string {
  return (minor / 100).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
