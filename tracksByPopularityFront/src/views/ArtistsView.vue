<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  Check,
  Library,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  WandSparkles,
} from '@lucide/vue'
import { useArtistSelection } from '@/composables/useArtistSelection'
import { useTrackActions } from '@/composables/useTrackActions'
import { useCatalogStore } from '@/stores/catalog'
import { useHistoryStore } from '@/stores/history'
import { useApiStore } from '@/stores/api'
import BaseDialog from '@/components/BaseDialog.vue'
import NotificationBanner from '@/components/NotificationBanner.vue'

const { t } = useI18n()
const catalogStore = useCatalogStore()
const historyStore = useHistoryStore()
const apiStore = useApiStore()
const confirmOpen = ref(false)
const { addTracksByArtist, loading, error, success } = useTrackActions()
const {
  artists,
  searchQuery,
  selectedArtist,
  loadingArtists,
  filteredArtists,
  fetchArtists,
  selectArtist,
  isRevalidating,
} = useArtistSelection()

const confirmArtistOrganization = async (): Promise<void> => {
  if (!selectedArtist.value) return
  const result = await addTracksByArtist(selectedArtist.value.id)
  if (result.success) {
    await Promise.all([
      catalogStore.refreshPlaylists(),
      historyStore.fetchSnapshots(true),
    ])
    confirmOpen.value = false
    selectedArtist.value = null
  }
}

onMounted(() => {
  void fetchArtists()
})
</script>

<template>
  <div class="page artists-page">
    <header class="page-heading">
      <div class="page-heading-copy">
        <p class="eyebrow">{{ t('artistsPage.eyebrow') }}</p>
        <h1 class="page-title">{{ t('artistsPage.title') }}</h1>
        <p class="page-description">{{ t('artistsPage.description') }}</p>
      </div>
      <span class="badge">
        <UsersRound :size="13" aria-hidden="true" />
        {{ t('artistsPage.artistCount', { count: artists.length }) }}
      </span>
    </header>

    <div class="artists-layout">
      <section class="artist-browser surface">
        <div class="artist-browser-header">
          <div>
            <h2>{{ t('artistsPage.libraryTitle') }}</h2>
            <p>{{ t('artistsPage.libraryDescription') }}</p>
          </div>
          <span v-if="isRevalidating" class="refreshing">
            <span class="spinner"></span>
            {{ t('common.refreshing') }}
          </span>
        </div>

        <div class="input-shell">
          <Search class="input-icon" :size="18" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="search"
            class="input has-icon"
            :placeholder="t('artist.searchPlaceholder')"
            :aria-label="t('artist.searchPlaceholder')"
            :disabled="loadingArtists"
          />
        </div>

        <div v-if="loadingArtists" class="artist-list" aria-hidden="true">
          <div v-for="index in 7" :key="index" class="artist-row skeleton"></div>
        </div>

        <div v-else-if="artists.length === 0" class="state-panel">
          <div>
            <span class="state-panel-icon"><Library :size="21" /></span>
            <h3>{{ t('artist.noArtists') }}</h3>
            <p>{{ t('artistsPage.emptyDescription') }}</p>
          </div>
        </div>

        <div v-else-if="filteredArtists.length === 0" class="state-panel">
          <div>
            <span class="state-panel-icon"><Search :size="21" /></span>
            <h3>{{ t('artist.noResults') }}</h3>
            <p>{{ t('artistsPage.noResultsDescription') }}</p>
          </div>
        </div>

        <div v-else class="artist-list">
          <button
            v-for="artistItem in filteredArtists"
            :key="artistItem.id"
            type="button"
            class="artist-row"
            :class="{ selected: selectedArtist?.id === artistItem.id }"
            @click="selectArtist(artistItem)"
          >
            <span class="artist-avatar"><UserRound :size="18" aria-hidden="true" /></span>
            <span class="artist-info">
              <strong>{{ artistItem.name }}</strong>
              <small>{{ t('artist.trackCount', { count: artistItem.count }) }}</small>
            </span>
            <span v-if="selectedArtist?.id === artistItem.id" class="selected-check">
              <Check :size="15" aria-hidden="true" />
            </span>
            <ArrowRight v-else :size="16" class="row-arrow" aria-hidden="true" />
          </button>
        </div>
      </section>

      <aside class="selection-panel surface" :class="{ active: selectedArtist }">
        <div class="selection-visual" aria-hidden="true">
          <span class="selection-orbit selection-orbit--one"></span>
          <span class="selection-orbit selection-orbit--two"></span>
          <span class="selection-core">
            <Sparkles :size="25" />
          </span>
        </div>

        <template v-if="selectedArtist">
          <p class="eyebrow">{{ t('artistsPage.selected') }}</p>
          <h2>{{ selectedArtist.name }}</h2>
          <p class="selection-description">
            {{ t('artistsPage.selectedDescription', { count: selectedArtist.count }) }}
          </p>

          <div class="playlist-preview">
            <span v-for="range in ['0—33', '34—66', '67—100']" :key="range">
              <i></i>
              {{ range }}
            </span>
          </div>

          <div class="safe-note">
            <ShieldCheck :size="17" aria-hidden="true" />
            <span>{{ t('artistsPage.backupNote') }}</span>
          </div>

          <button
            type="button"
            class="button button-primary organize-artist"
            @click="confirmOpen = true"
          >
            <WandSparkles :size="17" aria-hidden="true" />
            {{ t('artist.submitButton') }}
          </button>
        </template>

        <template v-else>
          <p class="eyebrow">{{ t('artistsPage.ready') }}</p>
          <h2>{{ t('artistsPage.selectTitle') }}</h2>
          <p class="selection-description">{{ t('artistsPage.selectDescription') }}</p>
        </template>
      </aside>
    </div>

    <BaseDialog
      :open="confirmOpen"
      :title="t('artistsPage.confirmTitle')"
      :description="t('artistsPage.confirmDescription')"
      :busy="loading"
      @close="confirmOpen = false"
    >
      <div v-if="selectedArtist" class="dialog-body">
        <div class="artist-confirm-card">
          <span class="artist-avatar"><UserRound :size="20" aria-hidden="true" /></span>
          <div>
            <strong>{{ selectedArtist.name }}</strong>
            <small>{{ t('artist.trackCount', { count: selectedArtist.count }) }}</small>
          </div>
        </div>
        <div class="confirmation-grid">
          <span v-for="range in ['0—33', '34—66', '67—100']" :key="range">{{ range }}</span>
        </div>
        <div class="safe-note">
          <ShieldCheck :size="17" aria-hidden="true" />
          <span>{{ t('artistsPage.backupNote') }}</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button
          type="button"
          class="button button-secondary"
          :disabled="loading"
          @click="confirmOpen = false"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="button button-primary"
          :disabled="loading"
          @click="confirmArtistOrganization"
        >
          <span v-if="loading" class="spinner"></span>
          <WandSparkles v-else :size="16" aria-hidden="true" />
          {{ loading ? t('common.loading') : t('artistsPage.confirmAction') }}
        </button>
      </div>
    </BaseDialog>

    <NotificationBanner
      v-if="success"
      :message="success"
      type="success"
      @close="apiStore.clearOperation('addTracksByArtist')"
    />
    <NotificationBanner
      v-if="error"
      :message="error"
      type="error"
      @close="apiStore.clearOperation('addTracksByArtist')"
    />
  </div>
</template>

<style scoped>
.artists-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(18rem, 0.75fr);
  gap: 1rem;
}

.artist-browser {
  min-width: 0;
  padding: 1.1rem;
}

.artist-browser-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.artist-browser-header h2 {
  font-size: 1.03rem;
}

.artist-browser-header p {
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.refreshing {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.artist-list {
  display: flex;
  max-height: calc(100dvh - 20rem);
  min-height: 20rem;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1rem;
  padding-right: 0.25rem;
  overflow-y: auto;
}

.artist-row {
  display: flex;
  min-height: 4.1rem;
  align-items: center;
  gap: 0.8rem;
  padding: 0.65rem 0.75rem;
  cursor: pointer;
  text-align: left;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.artist-row:hover {
  border-color: var(--color-border);
  background: var(--color-surface-hover);
  transform: translateX(2px);
}

.artist-row.selected {
  border-color: color-mix(in srgb, var(--color-accent) 34%, var(--color-border));
  background: linear-gradient(100deg, rgba(128, 87, 255, 0.14), rgba(22, 210, 255, 0.04));
}

.artist-avatar {
  display: grid;
  width: 2.55rem;
  height: 2.55rem;
  flex: none;
  place-items: center;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 0.85rem;
  background: var(--color-surface-elevated);
}

.artist-row.selected .artist-avatar {
  color: var(--color-cyan);
  border-color: rgba(27, 214, 255, 0.25);
  background: rgba(27, 214, 255, 0.07);
}

.artist-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.artist-info strong {
  overflow: hidden;
  font-size: 0.85rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist-info small,
.artist-confirm-card small {
  margin-top: 0.15rem;
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.row-arrow {
  color: var(--color-text-subtle);
}

.selected-check {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  place-items: center;
  color: #071812;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 15px rgba(43, 213, 118, 0.24);
}

.selection-panel {
  position: sticky;
  top: 0;
  display: flex;
  min-height: 32rem;
  align-self: start;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.4rem 1.4rem;
  overflow: hidden;
  text-align: center;
}

.selection-panel::before {
  position: absolute;
  top: -8rem;
  width: 18rem;
  height: 15rem;
  content: '';
  border-radius: 50%;
  background: rgba(129, 84, 255, 0.18);
  filter: blur(52px);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.selection-panel.active::before {
  opacity: 1;
}

.selection-visual {
  position: relative;
  display: grid;
  width: 8rem;
  height: 8rem;
  margin: 1.2rem auto 2.3rem;
  place-items: center;
}

.selection-orbit {
  position: absolute;
  border: 1px solid rgba(144, 111, 255, 0.28);
  border-radius: 50%;
}

.selection-orbit--one {
  width: 7rem;
  height: 7rem;
}

.selection-orbit--two {
  width: 8rem;
  height: 3.6rem;
  transform: rotate(-26deg);
}

.selection-core {
  display: grid;
  width: 3.6rem;
  height: 3.6rem;
  place-items: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1.1rem;
  background: linear-gradient(145deg, #8b61ff, #422394);
  box-shadow: 0 0 35px rgba(126, 86, 255, 0.35);
  transform: rotate(7deg);
}

.selection-panel h2 {
  margin-top: 0.35rem;
  font-size: 1.4rem;
  letter-spacing: -0.035em;
}

.selection-description {
  max-width: 18rem;
  margin-top: 0.6rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  line-height: 1.6;
}

.playlist-preview,
.confirmation-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45rem;
  margin-top: 1.25rem;
}

.playlist-preview span,
.confirmation-grid span {
  display: flex;
  min-height: 2.6rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 0.68rem;
  font-weight: 700;
}

.playlist-preview i {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
}

.playlist-preview span:nth-child(2) i {
  background: var(--color-cyan);
  box-shadow: 0 0 8px var(--color-cyan);
}

.playlist-preview span:nth-child(3) i {
  background: var(--color-magenta);
  box-shadow: 0 0 8px var(--color-magenta);
}

.safe-note {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 0.55rem;
  margin-top: 0.8rem;
  padding: 0.8rem;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  background: rgba(43, 213, 118, 0.06);
  font-size: 0.7rem;
  text-align: left;
}

.safe-note :deep(svg) {
  flex: none;
  color: var(--color-success);
}

.organize-artist {
  width: 100%;
  margin-top: auto;
}

.artist-confirm-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.artist-confirm-card > div {
  display: flex;
  flex-direction: column;
}

@media (max-width: 980px) {
  .artists-layout {
    grid-template-columns: 1fr;
  }

  .selection-panel {
    position: static;
    min-height: 25rem;
  }
}

@media (max-width: 620px) {
  .artist-list {
    max-height: none;
  }

  .selection-panel {
    min-height: 24rem;
  }
}
</style>
