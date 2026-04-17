<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useApiStore } from '@/stores/api'
import { authApiService } from '@/services/authApi'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const apiStore = useApiStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = t('auth.fillAllFields')
    return
  }

  loading.value = true
  error.value = null

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    apiStore.success = t('auth.loginSuccess')
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } else {
    error.value = result.error || t('auth.loginFailed')
  }

  loading.value = false
}

const handleSpotifyLogin = async () => {
  try {
    const response = await authApiService.getLoginUrl()
    if (response.success && response.data?.loginUrl) {
      window.location.href = response.data.loginUrl
    }
  } catch {
    error.value = t('auth.spotifyLoginFailed')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="title">{{ t('auth.loginTitle') }}</h1>
        <LanguageSwitcher />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">{{ t('auth.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            :disabled="loading"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">{{ t('auth.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            :placeholder="t('auth.passwordPlaceholder')"
            :disabled="loading"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="submit-button" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>{{ t('auth.loginButton') }}</span>
        </button>

        <div class="form-links">
          <router-link to="/forgot-password">{{ t('auth.forgotPassword') }}</router-link>
        </div>
      </form>

      <div class="divider">
        <span>{{ t('auth.or') }}</span>
      </div>

      <button @click="handleSpotifyLogin" class="spotify-button" :disabled="loading">
        <span class="spotify-icon">🎵</span>
        {{ t('auth.loginWithSpotify') }}
      </button>

      <div class="auth-footer">
        <p>
          {{ t('auth.noAccount') }}
          <router-link to="/register">{{ t('auth.register') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--color-background);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.error-message {
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: 8px;
  color: var(--color-error);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button {
  padding: 0.875rem 1.5rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-links {
  text-align: center;
  margin-top: 0.5rem;
}

.form-links a {
  font-size: 0.9rem;
  color: var(--color-primary);
  text-decoration: none;
}

.form-links a:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.divider span {
  padding: 0 1rem;
}

.spotify-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: #1db954;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spotify-button:hover:not(:disabled) {
  background: #1ed760;
  transform: translateY(-2px);
}

.spotify-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spotify-icon {
  font-size: 1.25rem;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.auth-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
