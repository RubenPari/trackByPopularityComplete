<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const resetToken = route.params.token as string
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const handleSubmit = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    error.value = t('auth.fillAllFields')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = t('auth.passwordsDoNotMatch')
    return
  }

  if (newPassword.value.length < 8) {
    error.value = t('auth.passwordMinLength')
    return
  }

  loading.value = true
  error.value = null

  const result = await authStore.resetPassword(resetToken, newPassword.value)

  if (result.success) {
    success.value = true
  } else {
    error.value = result.error || t('auth.resetPasswordFailed')
  }

  loading.value = false
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="title">{{ t('auth.resetPasswordTitle') }}</h1>
        <LanguageSwitcher />
      </div>

      <div v-if="success" class="success-message">
        <p>{{ t('auth.passwordResetSuccess') }}</p>
        <button @click="router.push('/login')" class="link-button">
          {{ t('auth.goToLogin') }}
        </button>
      </div>

      <template v-else>
        <p class="description">{{ t('auth.resetPasswordDescription') }}</p>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label for="newPassword">{{ t('auth.newPassword') }}</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              :placeholder="t('auth.newPasswordPlaceholder')"
              :disabled="loading"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">{{ t('auth.confirmPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              :placeholder="t('auth.confirmPasswordPlaceholder')"
              :disabled="loading"
              autocomplete="new-password"
            />
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>{{ t('auth.resetPasswordButton') }}</span>
          </button>
        </form>
      </template>
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
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.success-message {
  padding: 1.5rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  text-align: center;
}

.success-message p {
  color: var(--color-success);
  margin: 0 0 1rem 0;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
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
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
