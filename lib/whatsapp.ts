import { BRAND_PHONE } from '@/lib/brand'

/** E.164 digits for wa.me (Bangladesh: 880 + local without leading 0). */
function whatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('880')) return digits
  if (digits.startsWith('0')) return `880${digits.slice(1)}`
  return digits
}

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${whatsappDigits(BRAND_PHONE)}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export function enrollmentWhatsAppMessage(productTitle: string, studentName?: string): string {
  const who = studentName ? `I am ${studentName}. ` : ''
  return `Hello, ${who}I would like to enroll in "${productTitle}". Please help me complete my enrollment.`
}

export function orderWhatsAppMessage(
  orderId: string,
  items: { title: string; quantity: number }[],
  totalMinor: number,
  studentName?: string,
): string {
  const who = studentName ? `I am ${studentName}. ` : ''
  const lines = items.map((item) => `- ${item.title} x${item.quantity}`).join('\n')
  const totalMajor = (totalMinor / 100).toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `Hello, ${who}I would like to complete payment for my order (#${orderId.slice(-8)}):\n${lines}\nTotal: ৳${totalMajor}\nPlease help me complete my purchase.`
}
