import { ProductType } from '@/types/api'

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  [ProductType.BOOK]: 'Book',
  [ProductType.NOTES]: 'Notes',
  [ProductType.QUESTION_BANK]: 'Question bank',
  [ProductType.MATH_SUGGESTION]: 'Math suggestion',
  [ProductType.THEORY_SUGGESTION]: 'Theory suggestion',
  [ProductType.OTHER]: 'Other',
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending payment',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
}

export const PRODUCT_ACCESS_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  BLOCKED: 'Blocked',
  WITHDRAWN: 'Withdrawn',
}

export const PRODUCT_ACCESS_SOURCE_LABEL: Record<string, string> = {
  ORDER: 'Order',
  MANUAL: 'Manual sale',
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
