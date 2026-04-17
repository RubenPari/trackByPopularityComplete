<template>
  <div class="home-view">
    <header class="header">
      <div class="header-top">
        <h1 class="title">🎵 {{ t('home.title') }}</h1>
        <LanguageSwitcher />
      </div>
      <p class="subtitle">{{ t('home.subtitle') }}</p>
    </header>

    <main class="main-content">
      <TrackActions />

      <PopularityPlaylists />

      <div class="divider"></div>

      <ArtistForm />

      <div class="divider"></div>

      <BackupPanel />
    </main>

    <NotificationBanner
      v-if="apiStore.success"
      :message="apiStore.success"
      type="success"
      @close="apiStore.clearMessages"
    />
    <NotificationBanner
      v-if="apiStore.error"
      :message="apiStore.error"
      type="error"
      @close="apiStore.clearMessages"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useApiStore } from '@/stores/api'
import TrackActions from '@/components/TrackActions.vue'
import ArtistForm from '@/components/ArtistForm.vue'
import NotificationBanner from '@/components/NotificationBanner.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import BackupPanel from '@/components/BackupPanel.vue'
import PopularityPlaylists from '@/components/PopularityPlaylists.vue'

const { t } = useI18n()
const apiStore = useApiStore()
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.header-top .title {
  margin: 0;
}

.header-top :deep(.language-switcher) {
  position: absolute;
  right: 0;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
}

.subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: 1rem 0;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .home-view {
    padding: 1rem 0.5rem;
  }
}
</style>
