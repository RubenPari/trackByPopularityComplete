import type { ApiResponse } from '@/types/api'
import { apiClient } from './apiClient'
import { createLogger } from '@/utils/logger'
import { AxiosError } from 'axios'
import { ERROR_MESSAGES } from '@/utils/constants'

const logger = createLogger('HttpClient')

/**
 * Base HTTP client for making API requests
 * Provides typed API calls with error handling and logging using Axios
 */
export class HttpClient {
  /**
   * Makes an HTTP request and returns a typed response
   */
  async request<T = unknown>(
    endpoint: string,
    options: { method: string; data?: unknown },
  ): Promise<ApiResponse<T>> {
    const { method, data } = options
    logger.debug(`Making ${method} request to ${endpoint}`, { options })

    try {
      const response = await apiClient.request<ApiResponse<T>>({
        url: endpoint,
        method,
        data,
      })

      const responseData = response.data
      logger.debug(`Request successful: ${method} ${endpoint}`, { data: responseData })

      // Our backend now wraps everything in an ApiResponse wrapper
      if (responseData.success) {
        return {
          success: true,
          data: responseData.data as T,
          message: responseData.message,
        }
      } else {
        return {
          success: false,
          error: responseData.error || responseData.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          errorCode: response.status,
        }
      }
    } catch (error) {
      let errorMessage: string = ERROR_MESSAGES.CONNECTION_ERROR
      let errorCode = 0

      if (error instanceof AxiosError) {
        errorCode = error.response?.status || 0
        const data = error.response?.data as { error?: string; message?: string } | undefined
        errorMessage = data?.error || data?.message || error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      logger.error(`Request error: ${method} ${endpoint}`, error)

      return {
        success: false,
        error: errorMessage,
        errorCode,
      }
    }
  }

  /**
   * Makes a GET request
   */
  async get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * Makes a POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', data })
  }

  /**
   * Makes a PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', data })
  }

  /**
   * Makes a DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()
