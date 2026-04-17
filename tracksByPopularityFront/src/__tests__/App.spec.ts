import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import App from '../App.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'it',
  messages: { it: {}, en: {} },
})

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), i18n],
        stubs: {
          RouterView: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
