export function buildWatermarkLabel(
  studentName?: string | null,
  studentPhone?: string | null,
  fallbackName?: string | null,
  fallbackPhone?: string | null,
): string | null {
  const name = studentName ?? fallbackName
  const phone = studentPhone ?? fallbackPhone
  const label = [name, phone].filter(Boolean).join(" | ")
  return label || null
}
