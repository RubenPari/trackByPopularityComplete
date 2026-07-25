import { afterEach, describe, expect, it, vi } from 'vitest'

describe('environment configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses an empty API base URL for same-origin deployments', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'same-origin')
    vi.resetModules()

    const { ENV } = await import('@/config/env')

    expect(ENV.API_BASE_URL).toBe('')
  })

  it('preserves an absolute configured API base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    vi.resetModules()

    const { ENV } = await import('@/config/env')

    expect(ENV.API_BASE_URL).toBe('https://api.example.com')
  })
})
