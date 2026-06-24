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
      v-if="apiStore.getSuccess(GLOBAL_OPERATION_KEY)"
      :message="apiStore.getSuccess(GLOBAL_OPERATION_KEY)"
      type="success"
      @close="apiStore.clearOperation(GLOBAL_OPERATION_KEY)"
    />
    <NotificationBanner
      v-if="apiStore.getError(GLOBAL_OPERATION_KEY)"
      :message="apiStore.getError(GLOBAL_OPERATION_KEY)"
      type="error"
      @close="apiStore.clearOperation(GLOBAL_OPERATION_KEY)"
    />
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: 0;
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>

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

const GLOBAL_OPERATION_KEY = 'global'
</script>
