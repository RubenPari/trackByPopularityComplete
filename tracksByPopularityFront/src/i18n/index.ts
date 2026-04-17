import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import it from './locales/it.json'

function getDefaultLocale(): string {
  const saved = localStorage.getItem('locale')
  if (saved && ['en', 'it'].includes(saved)) return saved
  const browserLang = navigator.language.slice(0, 2)
  return ['en', 'it'].includes(browserLang) ? browserLang : 'it'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getDefaultLocale(),
  fallbackLocale: 'it',
  messages: { en, it },
})

export default i18n
