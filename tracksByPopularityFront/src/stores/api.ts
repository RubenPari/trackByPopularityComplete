import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/types/api'
import { createLogger } from '@/utils/logger'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants'
import i18n from '@/i18n'

const logger = createLogger('ApiStore')

export type OperationKey = string

export const useApiStore = defineStore('api', () => {
  const loading = ref<Record<OperationKey, boolean>>({})
  const errors = ref<Record<OperationKey, string | null>>({})
  const successes = ref<Record<OperationKey, string | null>>({})

  const anyLoading = computed(() => Object.values(loading.value).some(Boolean))

  const isLoading = (key: OperationKey): boolean => loading.value[key] ?? false
  const getError = (key: OperationKey): string | null => errors.value[key] ?? null
  const getSuccess = (key: OperationKey): string | null => successes.value[key] ?? null

  const clearOperation = (key: OperationKey) => {
    delete loading.value[key]
    delete errors.value[key]
    delete successes.value[key]
  }

  const clearMessages = () => {
    errors.value = {}
    successes.value = {}
  }

  const executeApiCall = async <T = unknown>(
    key: OperationKey,
    apiCall: () => Promise<ApiResponse<T>>,
    successMessage?: string,
  ) => {
    loading.value[key] = true
    errors.value[key] = null
    successes.value[key] = null

    const t = i18n.global.t

    try {
      logger.debug(`Executing API call: ${key}`)
      const response = await apiCall()

      if (response.success) {
        const message = successMessage
          ? t(successMessage)
          : response.message || t(SUCCESS_MESSAGES.OPERATION_SUCCESS)
        successes.value[key] = message
        logger.info(`API call succeeded: ${key}`, { message })
        return { success: true as const, data: response.data, message: response.message }
      } else {
        const errorMsg = response.error || t(ERROR_MESSAGES.UNKNOWN_ERROR)
        errors.value[key] = errorMsg
        logger.warn(`API call failed: ${key}`, { error: errorMsg, errorCode: response.errorCode })
        return { success: false as const, error: errorMsg }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(ERROR_MESSAGES.UNKNOWN_ERROR)
      errors.value[key] = errorMessage
      logger.error(`API call exception: ${key}`, err)
      return { success: false as const, error: errorMessage }
    } finally {
      loading.value[key] = false
    }
  }

  return {
    loading,
    errors,
    successes,
    anyLoading,
    isLoading,
    getError,
    getSuccess,
    executeApiCall,
    clearOperation,
    clearMessages,
  }
})
