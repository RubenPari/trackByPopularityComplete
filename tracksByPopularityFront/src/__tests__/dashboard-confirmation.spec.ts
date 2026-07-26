import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import HomeView from '@/views/HomeView.vue'
import itMessages from '@/i18n/locales/it.json'

const { getAllPlaylists, getSnapshots, addTracksByPopularity } = vi.hoisted(() => ({
  getAllPlaylists: vi.fn(),
  getSnapshots: vi.fn(),
  addTracksByPopularity: vi.fn(),
}))

vi.mock('@/services/playlistApi', () => ({
  playlistApiService: { getAllPlaylists },
}))

vi.mock('@/services/backupApi', () => ({
  backupApiService: {
    getSnapshots,
    restoreSnapshot: vi.fn(),
    deleteSnapshot: vi.fn(),
  },
}))

vi.mock('@/services/trackApi', () => ({
  trackApiService: {
    addTracksByPopularity,
    getLibraryArtists: vi.fn(),
    addTracksByArtist: vi.fn(),
  },
}))

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.setAttribute('open', '')
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.removeAttribute('open')
    },
  })
})

describe('dashboard organization confirmation', () => {
  beforeEach(() => {
    localStorage.clear()
    getAllPlaylists.mockReset()
    getSnapshots.mockReset()
    addTracksByPopularity.mockReset()
    getAllPlaylists.mockResolvedValue({ success: true, data: [] })
    getSnapshots.mockResolvedValue({ success: true, data: [] })
    addTracksByPopularity.mockResolvedValue({ success: true, data: undefined })
  })

  it('does not call the API until the user confirms', async () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [
          createPinia(),
          createI18n({
            legacy: false,
            locale: 'it',
            messages: { it: itMessages },
          }),
        ],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
          Transition: false,
        },
      },
    })

    await flushPromises()

    const rangeButton = wrapper
      .findAll('button')
      .find((button) => button.attributes('aria-label') === 'Organizza Popolarità Bassa')
    expect(rangeButton).toBeDefined()

    await rangeButton?.trigger('click')
    expect(addTracksByPopularity).not.toHaveBeenCalled()

    const confirmButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Avvia organizzazione'))
    expect(confirmButton).toBeDefined()

    await confirmButton?.trigger('click')
    await flushPromises()

    expect(addTracksByPopularity).toHaveBeenCalledWith('less')
  })
})
