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
  localStorage.removeItem(key)
}

/**
 * Clear all app caches from localStorage
 */
export function clearAllStorageCaches(): void {
  const CACHE_VERSION_KEY = 'cache_version'
  const CURRENT_CACHE_VERSION = 1

  // Update cache version to invalidate all old caches
  localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION.toString())

  // Clear all caches with old version
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.endsWith('-cache')) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

/**
 * Initialize cache versioning
 */
export function initStorageVersioning(): void {
  const CACHE_VERSION_KEY = 'cache_version'
  const CURRENT_CACHE_VERSION = 1

  const storedVersion = localStorage.getItem(CACHE_VERSION_KEY)
  if (!storedVersion || parseInt(storedVersion, 10) < CURRENT_CACHE_VERSION) {
    clearAllStorageCaches()
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION.toString())
  }
}
