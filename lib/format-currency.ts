/** Format a whole-taka amount for display (demo UI; API uses integer poisha). */
export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`
}
