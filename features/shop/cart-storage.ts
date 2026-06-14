export interface CartLine {
  productId: string
  quantity: number
}

const CART_KEY = 'sca_shop_cart_v1'

/** Stable empty snapshot for SSR / getServerSnapshot. */
export const EMPTY_CART: CartLine[] = []

const listeners = new Set<() => void>()

let cachedRaw: string | null | undefined
let cachedSnapshot: CartLine[] = EMPTY_CART
let cachedCount = 0

function parseCart(raw: string | null): CartLine[] {
  if (!raw) return EMPTY_CART
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return EMPTY_CART
    const items = parsed.filter(
      (line): line is CartLine =>
        typeof line === 'object' &&
        line !== null &&
        typeof (line as CartLine).productId === 'string' &&
        typeof (line as CartLine).quantity === 'number' &&
        (line as CartLine).quantity > 0,
    )
    return items.length === 0 ? EMPTY_CART : items
  } catch {
    return EMPTY_CART
  }
}

function refreshCache(): void {
  if (typeof window === 'undefined') {
    cachedRaw = undefined
    cachedSnapshot = EMPTY_CART
    cachedCount = 0
    return
  }

  const raw = window.localStorage.getItem(CART_KEY)
  if (raw === cachedRaw) return

  cachedRaw = raw
  cachedSnapshot = parseCart(raw)
  cachedCount = cachedSnapshot.reduce((sum, line) => sum + line.quantity, 0)
}

function emitChange(): void {
  refreshCache()
  listeners.forEach((listener) => listener())
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Stable snapshot for useSyncExternalStore (client). */
export function getCartSnapshot(): CartLine[] {
  refreshCache()
  return cachedSnapshot
}

/** Stable snapshot for useSyncExternalStore (client). */
export function getCartCountSnapshot(): number {
  refreshCache()
  return cachedCount
}

/** Stable snapshot for useSyncExternalStore (SSR). Must be referentially stable. */
export function getServerCartSnapshot(): CartLine[] {
  return EMPTY_CART
}

export function getServerCartCountSnapshot(): number {
  return 0
}

export function readCart(): CartLine[] {
  refreshCache()
  return cachedSnapshot
}

export function writeCart(items: CartLine[]): void {
  if (typeof window === 'undefined') return
  const next = items.length === 0 ? EMPTY_CART : items
  const serialized = JSON.stringify(next === EMPTY_CART ? [] : next)
  window.localStorage.setItem(CART_KEY, serialized)
  cachedRaw = serialized
  cachedSnapshot = next
  cachedCount = next.reduce((sum, line) => sum + line.quantity, 0)
  listeners.forEach((listener) => listener())
}

export function clearCart(): void {
  writeCart([])
}

export function addToCart(productId: string, quantity = 1): void {
  const items = readCart()
  const existing = items.find((line) => line.productId === productId)
  if (existing) {
    const next = items.map((line) =>
      line.productId === productId
        ? { ...line, quantity: Math.min(99, line.quantity + quantity) }
        : line,
    )
    writeCart(next)
    return
  }
  writeCart([...items, { productId, quantity }])
}

export function setCartQuantity(productId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId)
    return
  }
  const items = readCart()
  const next = items.map((line) =>
    line.productId === productId ? { ...line, quantity: Math.min(99, quantity) } : line,
  )
  writeCart(next)
}

export function removeFromCart(productId: string): void {
  writeCart(readCart().filter((line) => line.productId !== productId))
}

export function cartItemCount(): number {
  refreshCache()
  return cachedCount
}
