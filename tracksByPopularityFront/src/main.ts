import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/shared.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { validateEnv } from './config/env'
import { logger } from './utils/logger'

// Validate environment variables
try {
  validateEnv()
  logger.info('Application starting', {
    mode: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_API_BASE_URL,
  })
} catch (error) {
  logger.error('Environment validation failed', error)
  throw error
}

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)

app.mount('#app')

logger.info('Application mounted successfully')
