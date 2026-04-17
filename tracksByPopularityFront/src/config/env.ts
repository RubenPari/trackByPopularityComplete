/**
 * Environment configuration
 * Centralizes access to environment variables with type safety and defaults
 */

/**
 * Application environment
 */
export const ENV = {
  /**
   * API base URL from environment variable or default
   */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',

  /**
   * Whether the application is running in development mode
   */
  IS_DEV: import.meta.env.DEV,

  /**
   * Whether the application is running in production mode
   */
  IS_PROD: import.meta.env.PROD,

  /**
   * Application mode (development, production, etc.)
   */
  MODE: import.meta.env.MODE,
} as const

/**
 * Validates that required environment variables are set
 * @throws {Error} If required environment variables are missing
 */
export function validateEnv(): void {
  const required: Array<keyof typeof ENV> = ['API_BASE_URL']

  for (const key of required) {
    if (ENV[key] === undefined || ENV[key] === null) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

/**
 * Gets the full API URL for an endpoint
 * @param endpoint - The API endpoint path
 * @returns The full URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = ENV.API_BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${path}`
}
