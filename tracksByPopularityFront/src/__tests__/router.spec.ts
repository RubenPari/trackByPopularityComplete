import { beforeEach, describe, expect, it, vi } from 'vitest'

const { checkAuth } = vi.hoisted(() => ({
  checkAuth: vi.fn(),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    checkAuth,
  }),
}))

import router from '@/router'

describe('router guards', () => {
  beforeEach(async () => {
    checkAuth.mockReset()
    checkAuth.mockResolvedValue(false)
    await router.push('/login')
    await router.isReady()
  })

  it('redirects unauthenticated users away from protected sections', async () => {
    checkAuth.mockResolvedValue(false)

    await router.push('/artists')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('allows authenticated users to open the history section', async () => {
    checkAuth.mockResolvedValue(true)

    await router.push('/history')

    expect(router.currentRoute.value.name).toBe('history')
  })

  it('redirects authenticated guests from login to the dashboard', async () => {
    checkAuth.mockResolvedValue(true)

    await router.push('/history')
    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('home')
  })
})
