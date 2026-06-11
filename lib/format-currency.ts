/** Format a whole-taka amount for display (demo UI; API uses integer poisha). */
export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`
}

/** Format API poisha (minor units) as BDT for display. */
export function formatBdtMinor(minor: number): string {
  const major = minor / 100
  return `৳${major.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}
