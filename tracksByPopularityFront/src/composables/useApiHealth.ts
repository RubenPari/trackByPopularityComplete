import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

interface HealthStatus {
  status: string
  timestamp: string
  dependencies?: {
    redis: { status: string; message: string }
    spotify: { status: string; message: string }
  }
}

export function useApiHealth() {
  const isHealthy = ref<boolean | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const healthDetails = ref<HealthStatus | null>(null)

  const checkHealth = async (detailed = false) => {
    isLoading.value = true
    error.value = null

    try {
      const endpoint = detailed ? '/health/detailed' : '/health'
      const response = await fetch(`${API_BASE_URL}${endpoint}`)

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }

      const data = await response.json()
      healthDetails.value = data
      isHealthy.value = data.status === 'healthy'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Health check failed'
      isHealthy.value = false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isHealthy,
    isLoading,
    error,
    healthDetails,
    checkHealth,
  }
}
