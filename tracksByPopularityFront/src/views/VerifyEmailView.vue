<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const verifyToken = route.params.token as string
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref(false)

onMounted(async () => {
  const result = await authStore.verifyEmail(verifyToken)

  loading.value = false

  if (result.success) {
    success.value = true
  } else {
    error.value = result.error || t('auth.verificationFailed')
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="title">{{ t('auth.verifyEmailTitle') }}</h1>
        <LanguageSwitcher />
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>{{ t('auth.verifying') }}</p>
      </div>

      <div v-else-if="success" class="success-message">
        <span class="icon">✓</span>
        <p>{{ t('auth.emailVerified') }}</p>
        <button @click="router.push('/login')" class="link-button">
          {{ t('auth.goToLogin') }}
        </button>
      </div>

      <div v-else class="error-message">
        <span class="icon">✕</span>
        <p>{{ error }}</p>
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
  text-align: center;
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

.loading-state {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner-large {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.success-message {
  padding: 2rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--color-success);
  border-radius: 8px;
}

.success-message .icon {
  display: block;
  font-size: 3rem;
  color: var(--color-success);
  margin-bottom: 1rem;
}

.success-message p {
  color: var(--color-success);
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.error-message {
  padding: 2rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: 8px;
}

.error-message .icon {
  display: block;
  font-size: 3rem;
  color: var(--color-error);
  margin-bottom: 1rem;
}

.error-message p {
  color: var(--color-error);
  font-weight: 600;
  margin: 0;
}

.link-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.link-button:hover {
  background: var(--color-primary-hover);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
