import { ProductType } from '@/types/api'

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  [ProductType.BOOK]: 'Book',
  [ProductType.NOTES]: 'Notes',
  [ProductType.QUESTION_BANK]: 'Question bank',
  [ProductType.OTHER]: 'Other',
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending payment',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
