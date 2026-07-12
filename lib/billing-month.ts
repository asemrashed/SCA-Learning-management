export function currentBillingMonthValue(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatBillingMonthLabel(billingMonth: string): string {
  if (billingMonth === 'ENROLLMENT') return 'Enrollment fee'
  const [year, month] = billingMonth.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}
