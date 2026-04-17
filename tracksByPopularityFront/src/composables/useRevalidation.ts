import { ref, onUnmounted, type Ref } from 'vue'

/**
 * Composable for managing data revalidation.
 * Follows SRP: Only responsible for revalidation logic.
 */

export interface UseRevalidationOptions {
  /** Time in ms before cache is considered stale */
  staleTime: number
  /** Whether to revalidate on window focus */
  revalidateOnFocus?: boolean
  /** Whether to revalidate on network reconnect */
  revalidateOnReconnect?: boolean
  /** Callback when revalidation state changes */
  onRevalidating?: (isRevalidating: boolean) => void
}

export interface UseRevalidationResult {
  /** Whether data is being refreshed in background */
  isRevalidating: Ref<boolean>
  /** Check if cache is stale */
  isCacheStale: () => boolean
  /** Start background revalidation */
  revalidate: (refresh: () => Promise<void>) => void
  /** Force immediate refresh */
  forceRefresh: (refresh: () => Promise<void>) => Promise<void>
}

/**
 * Manages revalidation logic following SRP.
 */
export function useRevalidation(options: UseRevalidationOptions): UseRevalidationResult {
  const {
    staleTime,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    onRevalidating,
  } = options

  const isRevalidating = ref(false)
  let lastUpdated: number | null = null

  const isCacheStale = (): boolean => {
    if (!lastUpdated) return true
    return Date.now() - lastUpdated > staleTime
  }

  const revalidate = (refresh: () => Promise<void>): void => {
    // Don't revalidate if already revalidating
    if (isRevalidating.value) return

    // If data is stale, refresh immediately
    if (isCacheStale()) {
      forceRefresh(refresh)
      return
    }

    // Otherwise, do background refresh
    isRevalidating.value = true
    onRevalidating?.(true)

    // Don't await - let it run in background
    refresh().finally(() => {
      isRevalidating.value = false
      onRevalidating?.(false)
      lastUpdated = Date.now()
    })
  }

  const forceRefresh = async (refresh: () => Promise<void>): Promise<void> => {
    isRevalidating.value = true
    onRevalidating?.(true)

    try {
      await refresh()
      lastUpdated = Date.now()
    } finally {
      isRevalidating.value = false
      onRevalidating?.(false)
    }
  }

  // Set up focus revalidation (OCP: easy to add new event handlers)
  if (revalidateOnFocus && typeof window !== 'undefined') {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible' && !isCacheStale()) {
        // This should be called with the actual refresh function
      }
    }

    const handleFocus = (): void => {
      // This should be called with the actual refresh function
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    })
  }

  // Set up reconnect revalidation
  if (revalidateOnReconnect && typeof window !== 'undefined') {
    const handleOnline = (): void => {
      // This should be called with the actual refresh function
    }

    window.addEventListener('online', handleOnline)

    onUnmounted(() => {
      window.removeEventListener('online', handleOnline)
    })
  }

  return {
    isRevalidating,
    isCacheStale,
    revalidate,
    forceRefresh,
  }
}
