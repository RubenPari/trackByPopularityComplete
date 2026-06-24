<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="page-simple settings-page">
    <div class="panel settings-container">
      <div class="flex-header settings-header">
        <h1 class="title-gradient">{{ t('settings.title') }}</h1>
        <LanguageSwitcher />
      </div>

      <section class="settings-section">
        <h2>{{ t('settings.account') }}</h2>
        <p class="description text-secondary">{{ t('settings.spotifyOnlyDescription') }}</p>
      </section>

      <section class="settings-section danger-zone">
        <h2>{{ t('settings.dangerZone') }}</h2>
        <button type="button" class="btn-outline-danger logout-button" @click="handleLogout">
          {{ t('settings.logout') }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  background: var(--color-background);
}

.settings-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
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

.description {
  line-height: 1.5;
}

.danger-zone {
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
}

.danger-zone h2 {
  color: var(--color-error);
}
</style>
