/** Display student ID from roll number or user id (temporary until dedicated student id field). */
export function formatStudentId(rollNumber: string | null | undefined, userId: string): string {
  if (rollNumber) return rollNumber
  const suffix = userId.replace(/\D/g, '').slice(-6) || userId.slice(-6).toUpperCase()
  return `SRD - ${suffix}`
}
