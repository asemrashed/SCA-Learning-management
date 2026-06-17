import { BRAND_NAME, BRAND_PHONE } from '@/lib/brand'
import { formatBdtMinor } from '@/lib/format-currency'

function normalizeBdPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('880')) return digits
  if (digits.startsWith('0')) return `880${digits.slice(1)}`
  return digits
}

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${normalizeBdPhone(BRAND_PHONE)}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export function enrollmentWhatsAppMessage(productTitle: string, studentName?: string): string {
  const who = studentName ? `I am ${studentName}. ` : ''
  return `Hello, ${who}I would like to enroll in "${productTitle}".`
}

export function orderWhatsAppMessage(
  orderId: string,
  items: { title: string; quantity: number }[],
  totalMinor: number,
  studentName?: string,
): string {
  const who = studentName ? `I am ${studentName}. ` : ''
  const lines = items.map((item) => `- ${item.title} × ${item.quantity}`).join('\n')
  return `Hello, ${who}I placed order #${orderId.slice(0, 8)}:\n${lines}\nTotal: ${formatBdtMinor(totalMinor)}`
}

export function examSubmitMessage(courseTitle: string, studentName: string): string {
  return `Hello ${BRAND_NAME}, I have completed my exam for "${courseTitle}". Student: ${studentName}.`
}

export function assignmentSubmitMessage(courseTitle: string, studentName: string): string {
  return `Hello ${BRAND_NAME}, I am submitting my assignment for "${courseTitle}". Student: ${studentName}.`
}
