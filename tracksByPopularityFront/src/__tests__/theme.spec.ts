import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    vi.resetModules()
  })

  it('defaults to dark and persists a manual selection', async () => {
    const { useTheme } = await import('@/composables/useTheme')
    const { theme, setTheme } = useTheme()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')

    setTheme('light')

    expect(theme.value).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('restores a saved theme before the app mounts', async () => {
    localStorage.setItem('theme', 'light')

    const { useTheme } = await import('@/composables/useTheme')

    expect(useTheme().theme.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
