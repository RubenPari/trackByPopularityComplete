import { expect, test, type Page } from '@playwright/test'

const playlists = [
  { id: 'low', name: 'Popularity: 0-20', totalTracks: 12 },
  { id: 'medium', name: 'Popularity: 41-60', totalTracks: 34 },
  { id: 'high', name: 'Popularity: 81-100', totalTracks: 18 },
]

const snapshots = [
  {
    id: 'snapshot-1',
    playlistId: 'low',
    playlistName: 'Popularity: 0-20',
    operationType: 'popularity',
    createdAt: '2026-07-25T10:00:00Z',
    trackCount: 12,
  },
]

async function mockApi(page: Page, authenticated = true): Promise<void> {
  await page.route('**/api/auth/is-auth', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: { authenticated, userId: authenticated ? 'spotify-user' : undefined },
      },
    })
  })
  await page.route('**/api/playlist/all', async (route) => {
    await route.fulfill({ json: { success: true, data: playlists } })
  })
  await page.route('**/api/backup/list', async (route) => {
    await route.fulfill({ json: { success: true, data: snapshots } })
  })
  await page.route('**/api/track/artists', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: [
          { id: 'artist-1', name: 'Neon Echoes', count: 9 },
          { id: 'artist-2', name: 'Night Signals', count: 5 },
        ],
      },
    })
  })
  await page.route('**/api/track/popularity/**', async (route) => {
    await route.fulfill({ json: { success: true, data: null } })
  })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('locale', 'en')
    localStorage.setItem('theme', 'dark')
  })
})

test('shows the redesigned Spotify login to unauthenticated users', async ({ page }) => {
  await mockApi(page, false)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Discover the rhythm of your music.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Spotify' })).toBeVisible()
})

test('navigates the app, persists theme and confirms organization', async ({ page }) => {
  await mockApi(page)
  let organizationRequests = 0
  page.on('request', (request) => {
    if (request.url().includes('/api/track/popularity/less')) organizationRequests += 1
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Give your Spotify library a rhythm.' })).toBeVisible()

  await page.getByRole('button', { name: 'Organize Low Popularity' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(organizationRequests).toBe(0)
  await page.getByRole('button', { name: 'Start organizing' }).click()
  await expect.poll(() => organizationRequests).toBe(1)

  await page.getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Light' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('uses bottom navigation on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockApi(page)
  await page.goto('/')

  const mainNavigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(mainNavigation.getByRole('link', { name: 'Artists' })).toBeVisible()
  await mainNavigation.getByRole('link', { name: 'Artists' }).click()
  await expect(page.getByRole('heading', { name: 'Organize by artist' })).toBeVisible()
})
