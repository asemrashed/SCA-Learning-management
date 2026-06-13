export function formatCertificateDate(iso: string): string {
  const date = new Date(iso)
  const day = date.getDate()
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th'
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  return `${day}${suffix} ${month} ${date.getFullYear()}`
}

export function buildCertificateBody(studentName: string, productTitle: string): string {
  return `This certificate is awarded to ${studentName} in recognition of successful completion of ${productTitle}. We congratulate the recipient on this achievement with Sharif Commerce Academy.`
}

export const CERTIFICATE_DIRECTOR = 'Director, SCA'
