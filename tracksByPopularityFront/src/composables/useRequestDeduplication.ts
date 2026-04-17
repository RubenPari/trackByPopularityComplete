/**
 * Module-level request deduplication
 * Prevents multiple identical API calls from being made simultaneously
 */

interface PendingRequest {
  promise: Promise<unknown>
  timestamp: number
}

// Store pending requests by their unique key
const pendingRequests = new Map<string, PendingRequest>()

// Clean up old requests (older than 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
const MAX_REQUEST_AGE = 5 * 60 * 1000

setInterval(() => {
  const now = Date.now()
  for (const [key, request] of pendingRequests.entries()) {
    if (now - request.timestamp > MAX_REQUEST_AGE) {
      pendingRequests.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

/**
 * Creates a deduplicated request function
 * If the same request is already in progress, it returns the existing promise
 * instead of making a new request
 *
 * @param key - Unique identifier for the request type
 * @param requestFn - The actual request function to execute
 * @returns The result of the request
 */
export async function deduplicatedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  // Check if there's already a pending request for this key
  const existing = pendingRequests.get(key)

  if (existing) {
    // Return the existing promise to avoid duplicate requests
    return existing.promise as Promise<T>
  }

  // Create new request
  const promise = requestFn().finally(() => {
    // Clean up after request completes
    pendingRequests.delete(key)
  }) as Promise<unknown>

  // Store the pending request
  pendingRequests.set(key, {
    promise,
    timestamp: Date.now(),
  })

  return promise as Promise<T>
}

/**
 * Creates a cache key based on the function name and arguments
 *
 * @param prefix - Prefix for the cache key (e.g., 'artists', 'playlists')
 * @param args - Arguments to include in the key
 * @returns A unique cache key
 */
export function createCacheKey(
  prefix: string,
  ...args: (string | number | boolean | undefined | null)[]
): string {
  const argsString = args.filter(Boolean).join(':')
  return `${prefix}:${argsString}`
}

/**
 * Clears all pending requests
 * Useful for testing or when the user logs out
 */
export function clearPendingRequests(): void {
  pendingRequests.clear()
}

/**
 * Gets the count of pending requests
 * Useful for debugging
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size
}
