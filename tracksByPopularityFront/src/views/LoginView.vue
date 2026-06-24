<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref<string | null>(null)

const handleSpotifyLogin = async () => {
  loading.value = true
  error.value = null

  try {
    await authStore.redirectToSpotifyLogin()
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('auth.spotifyLoginFailed')
    loading.value = false
  }
}
</script>

<template>
  <div class="page-centered auth-page">
    <div class="panel panel-narrow auth-container">
      <div class="flex-header auth-header">
        <h1 class="title-gradient">{{ t('auth.loginTitle') }}</h1>
        <LanguageSwitcher />
      </div>

      <p class="description text-secondary">{{ t('auth.loginDescription') }}</p>

      <div v-if="error" class="alert-error" role="alert">
        {{ error }}
      </div>

      <button
        type="button"
        class="btn-spotify"
        :disabled="loading"
        @click="handleSpotifyLogin"
      >
        <span v-if="loading" class="spinner-small" aria-hidden="true"></span>
        <span v-else class="spotify-icon" aria-hidden="true">🎵</span>
        {{ loading ? t('common.loading') : t('auth.loginWithSpotify') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  background: var(--color-background);
}

.auth-container {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.auth-header {
  margin-bottom: 1.5rem;
}

.description {
  margin-bottom: 1.5rem;
  text-align: center;
}

.spotify-icon {
  font-size: 1.25rem;
}
</style>
