export function slugifyTitle(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Alternating grid spans matching the home learning-categories layout. */
export function categoryColSpan(index: number): string {
  return index % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-10'
}
