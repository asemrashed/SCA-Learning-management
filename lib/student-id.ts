/** Display student ID from assigned idNumber or a SCA-prefixed fallback from user id. */
export function formatStudentId(idNumber: string | null | undefined, userId: string): string {
  if (idNumber) return idNumber
  const suffix = userId.replace(/\D/g, '').slice(-6) || userId.slice(-6).toUpperCase()
  return `SCA - ${suffix}`
}
