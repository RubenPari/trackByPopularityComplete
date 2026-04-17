<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { accountApiService } from '@/services/accountApi'
import { useApiStore } from '@/stores/api'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const apiStore = useApiStore()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)

const spotifyLinked = ref(false)
const spotifyLoading = ref(false)
const spotifyError = ref<string | null>(null)

onMounted(async () => {
  await authStore.refreshSpotifyStatus()
  spotifyLinked.value = authStore.spotifyLinked

  const urlParams = new URLSearchParams(window.location.search)
  const success = urlParams.get('success')
  const error = urlParams.get('error')

  if (success === 'spotify_linked') {
    const spotifyUserId = urlParams.get('spotify_user_id')
    if (spotifyUserId) {
      localStorage.setItem('spotify_user_id', spotifyUserId)
    }
    apiStore.success = t('auth.spotifyLinkedSuccess')
    await authStore.refreshSpotifyStatus()
    spotifyLinked.value = authStore.spotifyLinked
  } else if (error) {
    apiStore.error = t(`auth.spotifyErrors.${error}`) || t('auth.spotifyLinkFailed')
  }
})

const handleChangePassword = async () => {
  passwordError.value = null
  passwordSuccess.value = false

  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = t('auth.fillAllFields')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = t('auth.passwordsDoNotMatch')
    return
  }

  if (newPassword.value.length < 8) {
    passwordError.value = t('auth.passwordMinLength')
    return
  }

  loading.value = true

  const result = await authStore.changePassword(oldPassword.value, newPassword.value)

  if (result.success) {
    passwordSuccess.value = true
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    passwordError.value = result.error || t('auth.changePasswordFailed')
  }

  loading.value = false
}

const handleLinkSpotify = async () => {
  spotifyLoading.value = true
  spotifyError.value = null

  try {
    const response = await accountApiService.getSpotifyLinkUrl()
    if (response.success && response.data?.linkUrl) {
      window.location.href = response.data.linkUrl
    }
  } catch {
    spotifyError.value = t('auth.spotifyLinkFailed')
  }

  spotifyLoading.value = false
}

const handleUnlinkSpotify = async () => {
  if (!confirm(t('auth.confirmUnlinkSpotify'))) {
    return
  }

  spotifyLoading.value = true

  try {
    const response = await accountApiService.unlinkSpotify()
    if (response.success) {
      authStore.setSpotifyLinked(false)
      spotifyLinked.value = false
      apiStore.success = t('auth.spotifyUnlinkedSuccess')
    }
  } catch {
    apiStore.error = t('auth.spotifyUnlinkFailed')
  }

  spotifyLoading.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="settings-page">
    <div class="settings-container">
      <div class="settings-header">
        <h1 class="title">{{ t('settings.title') }}</h1>
        <LanguageSwitcher />
      </div>

      <div class="user-info">
        <div class="info-row">
          <span class="label">{{ t('settings.email') }}:</span>
          <span class="value">{{ authStore.user?.email }}</span>
        </div>
        <div class="info-row">
          <span class="label">{{ t('settings.emailVerified') }}:</span>
          <span :class="['badge', authStore.isEmailVerified ? 'success' : 'warning']">
            {{ authStore.isEmailVerified ? t('common.yes') : t('common.no') }}
          </span>
        </div>
      </div>

      <section class="settings-section">
        <h2>{{ t('settings.changePassword') }}</h2>

        <div v-if="passwordSuccess" class="success-message">
          {{ t('auth.passwordChangedSuccess') }}
        </div>

        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>

        <form @submit.prevent="handleChangePassword" class="form">
          <div class="form-group">
            <label for="oldPassword">{{ t('settings.currentPassword') }}</label>
            <input
              id="oldPassword"
              v-model="oldPassword"
              type="password"
              :disabled="loading"
              autocomplete="current-password"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">{{ t('settings.newPassword') }}</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              :disabled="loading"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">{{ t('settings.confirmNewPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              :disabled="loading"
              autocomplete="new-password"
            />
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>{{ t('settings.changePasswordButton') }}</span>
          </button>
        </form>
      </section>

      <section class="settings-section">
        <h2>{{ t('settings.spotifyAccount') }}</h2>

        <div v-if="spotifyError" class="error-message">
          {{ spotifyError }}
        </div>

        <div class="spotify-status">
          <div class="status-row">
            <span class="label">{{ t('settings.spotifyStatus') }}:</span>
            <span :class="['badge', spotifyLinked ? 'success' : 'warning']">
              {{ spotifyLinked ? t('settings.linked') : t('settings.notLinked') }}
            </span>
          </div>
        </div>

        <div class="spotify-actions">
          <button
            v-if="!spotifyLinked"
            @click="handleLinkSpotify"
            class="spotify-button"
            :disabled="spotifyLoading"
          >
            <span v-if="spotifyLoading" class="spinner"></span>
            <span v-else>🎵</span>
            {{ t('settings.linkSpotify') }}
          </button>

          <button
            v-else
            @click="handleUnlinkSpotify"
            class="unlink-button"
            :disabled="spotifyLoading"
          >
            <span v-if="spotifyLoading" class="spinner"></span>
            <span v-else>🔗</span>
            {{ t('settings.unlinkSpotify') }}
          </button>
        </div>
      </section>

      <section class="settings-section danger-zone">
        <h2>{{ t('settings.dangerZone') }}</h2>
        <button @click="handleLogout" class="logout-button">
          {{ t('settings.logout') }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 2rem 1rem;
  background: var(--color-background);
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
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

.user-info {
  background: var(--color-background-mute);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.info-row .label {
  color: var(--color-text-secondary);
}

.info-row .value {
  font-weight: 600;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge.success {
  background: rgba(16, 185, 129, 0.2);
  color: var(--color-success);
}

.badge.warning {
  background: rgba(251, 191, 36, 0.2);
  color: var(--color-warning);
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.form {
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

.spotify-status {
  background: var(--color-background-mute);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-row .label {
  color: var(--color-text-secondary);
}

.spotify-actions {
  display: flex;
  gap: 1rem;
}

.spotify-button,
.unlink-button {
  flex: 1;
  padding: 0.875rem 1.5rem;
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

.spotify-button {
  background: #1db954;
  color: white;
}

.spotify-button:hover:not(:disabled) {
  background: #1ed760;
}

.unlink-button {
  background: var(--color-background);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.unlink-button:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
}

.unlink-button:disabled,
.spotify-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.danger-zone {
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
}

.danger-zone h2 {
  color: var(--color-error);
}

.logout-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: transparent;
  color: var(--color-error);
  border: 2px solid var(--color-error);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: var(--color-error);
  color: white;
}

.success-message {
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  color: var(--color-success);
  font-size: 0.9rem;
  margin-bottom: 1rem;
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
