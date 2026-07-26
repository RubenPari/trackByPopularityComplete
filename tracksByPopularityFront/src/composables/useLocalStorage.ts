/**
 * LocalStorage composable following SRP.
 * Only responsible for localStorage operations.
 */

/**
 * Load data from localStorage
 */
export function loadFromStorage<T>(key: string, staleTime: number): T | null {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const parsed = JSON.parse(cached) as { data: T; timestamp: number }

    // Check if cache is expired
    if (Date.now() - parsed.timestamp > staleTime) {
      localStorage.removeItem(key)
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}

/**
 * Save data to localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    const toCache = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(toCache))
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Clear specific key from localStorage
 */
export function clearStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // localStorage might be unavailable
  }
}
