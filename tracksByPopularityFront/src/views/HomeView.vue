<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  Clock3,
  Disc3,
  Library,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from '@lucide/vue'
import { useCatalogStore } from '@/stores/catalog'
import { useHistoryStore } from '@/stores/history'
import { useApiStore } from '@/stores/api'
import { useTrackActions } from '@/composables/useTrackActions'
import { POPULARITY_TIERS, type PopularityTier } from '@/config/popularity'
import { SUCCESS_MESSAGES } from '@/utils/constants'
import BaseDialog from '@/components/BaseDialog.vue'
import NotificationBanner from '@/components/NotificationBanner.vue'

const { t, locale } = useI18n()
const catalogStore = useCatalogStore()
const historyStore = useHistoryStore()
const apiStore = useApiStore()
const { addTracksByPopularity, loading, error, success } = useTrackActions()
const selectedTier = ref<PopularityTier | null>(null)

const successKeys = {
  less: SUCCESS_MESSAGES.TRACKS_ADDED_LESS,
  'less-medium': SUCCESS_MESSAGES.TRACKS_ADDED_LESS_MEDIUM,
  medium: SUCCESS_MESSAGES.TRACKS_ADDED_MEDIUM,
  'more-medium': SUCCESS_MESSAGES.TRACKS_ADDED_MORE_MEDIUM,
  more: SUCCESS_MESSAGES.TRACKS_ADDED_MORE,
} as const

const tierCards = computed(() =>
  POPULARITY_TIERS.map((tier) => {
    const playlist = catalogStore.playlists.find((item) =>
      tier.playlistNames.includes(item.name),
    )
    return {
      ...tier,
      title: t(`tracks.popularity.${tier.translationKey}.title`),
      description: t(`tracks.popularity.${tier.translationKey}.description`),
      trackCount: playlist?.totalTracks ?? 0,
      exists: Boolean(playlist),
    }
  }),
)

const managedPlaylists = computed(() => tierCards.value.filter((tier) => tier.exists).length)
const totalTracks = computed(() =>
  tierCards.value.reduce((total, tier) => total + tier.trackCount, 0),
)

const latestActivity = computed(() => {
  const snapshot = historyStore.latestSnapshot
  if (!snapshot) return t('dashboard.noActivity')
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(snapshot.createdAt))
})

const formatFullDate = (date: string): string =>
  new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

const openConfirmation = (tier: PopularityTier): void => {
  selectedTier.value = tier
}

const confirmOrganization = async (): Promise<void> => {
  if (!selectedTier.value) return
  const tier = selectedTier.value
  const result = await addTracksByPopularity(tier.id, successKeys[tier.id])
  if (result.success) {
    await Promise.all([
      catalogStore.refreshPlaylists(),
      historyStore.fetchSnapshots(true),
    ])
    selectedTier.value = null
  }
}

const refreshDashboard = async (): Promise<void> => {
  await Promise.all([
    catalogStore.refreshPlaylists(),
    historyStore.fetchSnapshots(true),
  ])
}

onMounted(() => {
  void Promise.all([
    catalogStore.initializePlaylists(),
    historyStore.fetchSnapshots(),
  ])
})
</script>

<template>
  <div class="page dashboard-page">
    <header class="page-heading dashboard-heading">
      <div class="page-heading-copy">
        <p class="eyebrow">{{ t('dashboard.eyebrow') }}</p>
        <h1 class="page-title">
          {{ t('dashboard.titleStart') }}
          <span>{{ t('dashboard.titleAccent') }}</span>
        </h1>
        <p class="page-description">{{ t('dashboard.description') }}</p>
      </div>
      <button
        type="button"
        class="button button-ghost"
        :disabled="catalogStore.playlistsRefreshing || historyStore.refreshing"
        @click="refreshDashboard"
      >
        <RefreshCw
          :size="16"
          :class="{ rotating: catalogStore.playlistsRefreshing || historyStore.refreshing }"
          aria-hidden="true"
        />
        {{ t('dashboard.refresh') }}
      </button>
    </header>

    <section class="stats-grid" :aria-label="t('dashboard.summary')">
      <article class="stat-card surface">
        <span class="stat-icon stat-icon--violet"><Library :size="19" aria-hidden="true" /></span>
        <div>
          <span class="stat-label">{{ t('dashboard.managedPlaylists') }}</span>
          <strong>{{ managedPlaylists }}<small>/5</small></strong>
        </div>
        <span class="stat-glow stat-glow--violet" aria-hidden="true"></span>
      </article>
      <article class="stat-card surface">
        <span class="stat-icon stat-icon--cyan"><Disc3 :size="19" aria-hidden="true" /></span>
        <div>
          <span class="stat-label">{{ t('dashboard.totalTracks') }}</span>
          <strong>{{ totalTracks.toLocaleString(locale) }}</strong>
        </div>
        <span class="stat-glow stat-glow--cyan" aria-hidden="true"></span>
      </article>
      <article class="stat-card surface">
        <span class="stat-icon stat-icon--pink"><Clock3 :size="19" aria-hidden="true" /></span>
        <div>
          <span class="stat-label">{{ t('dashboard.lastActivity') }}</span>
          <strong class="stat-date">{{ latestActivity }}</strong>
        </div>
        <span class="stat-glow stat-glow--pink" aria-hidden="true"></span>
      </article>
    </section>

    <section class="organize-section">
      <div class="section-heading">
        <div>
          <h2>{{ t('dashboard.organizeTitle') }}</h2>
          <p>{{ t('dashboard.organizeDescription') }}</p>
        </div>
        <span class="badge"><ShieldCheck :size="13" /> {{ t('dashboard.backupIncluded') }}</span>
      </div>

      <div v-if="catalogStore.playlistsLoading" class="tier-grid" aria-hidden="true">
        <div v-for="index in 5" :key="index" class="tier-card skeleton"></div>
      </div>

      <div v-else class="tier-grid">
        <button
          v-for="(tier, index) in tierCards"
          :key="tier.id"
          type="button"
          class="tier-card surface"
          :class="`tier-${tier.id}`"
          :aria-label="t('dashboard.organizeRange', { name: tier.title })"
          @click="openConfirmation(tier)"
        >
          <div class="tier-card-top">
            <span class="tier-index">0{{ index + 1 }}</span>
            <span class="tier-count">{{ t('backup.trackCount', { count: tier.trackCount }) }}</span>
          </div>
          <div class="tier-orbit" aria-hidden="true">
            <span></span>
          </div>
          <div class="tier-card-copy">
            <p>{{ tier.min }}—{{ tier.max }}</p>
            <h3>{{ tier.title }}</h3>
            <span>{{ tier.exists ? t('dashboard.ready') : t('dashboard.willCreate') }}</span>
          </div>
          <span class="tier-action">
            {{ t('dashboard.organize') }}
            <ArrowRight :size="15" aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>

    <section v-if="historyStore.latestSnapshot" class="latest-card surface">
      <div class="latest-icon"><Sparkles :size="20" aria-hidden="true" /></div>
      <div class="latest-copy">
        <span>{{ t('dashboard.latestBackup') }}</span>
        <strong>{{ historyStore.latestSnapshot.playlistName }}</strong>
        <small>
          {{ formatFullDate(historyStore.latestSnapshot.createdAt) }}
          ·
          {{ t('backup.trackCount', { count: historyStore.latestSnapshot.trackCount }) }}
        </small>
      </div>
      <RouterLink to="/history" class="button button-secondary">
        {{ t('dashboard.viewHistory') }}
        <ArrowRight :size="15" aria-hidden="true" />
      </RouterLink>
    </section>

    <BaseDialog
      :open="Boolean(selectedTier)"
      :title="t('dashboard.confirmTitle')"
      :description="t('dashboard.confirmDescription')"
      :busy="loading"
      @close="selectedTier = null"
    >
      <div v-if="selectedTier" class="dialog-body">
        <div class="confirmation-range" :class="`tier-${selectedTier.id}`">
          <span class="confirmation-icon"><WandSparkles :size="22" aria-hidden="true" /></span>
          <div>
            <p>{{ selectedTier.min }}—{{ selectedTier.max }}</p>
            <strong>{{ t(`tracks.popularity.${selectedTier.translationKey}.title`) }}</strong>
          </div>
        </div>
        <div class="confirmation-note">
          <ShieldCheck :size="18" aria-hidden="true" />
          <p>{{ t('dashboard.backupNote') }}</p>
        </div>
      </div>
      <div class="dialog-actions">
        <button
          type="button"
          class="button button-secondary"
          :disabled="loading"
          @click="selectedTier = null"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="button button-primary"
          :disabled="loading"
          @click="confirmOrganization"
        >
          <span v-if="loading" class="spinner"></span>
          <WandSparkles v-else :size="16" aria-hidden="true" />
          {{ loading ? t('common.loading') : t('dashboard.confirmAction') }}
        </button>
      </div>
    </BaseDialog>

    <NotificationBanner
      v-if="success"
      :message="success"
      type="success"
      @close="apiStore.clearOperation('addTracksByPopularity')"
    />
    <NotificationBanner
      v-if="error"
      :message="error"
      type="error"
      @close="apiStore.clearOperation('addTracksByPopularity')"
    />
  </div>
</template>

<style scoped>
.dashboard-heading .page-title span {
  color: transparent;
  background: linear-gradient(90deg, #9b7cff, #35d9ff 55%, #ef70d7);
  background-clip: text;
  -webkit-background-clip: text;
}

.rotating {
  animation: spin 0.8s linear infinite;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  position: relative;
  display: flex;
  min-height: 7.2rem;
  align-items: center;
  gap: 1rem;
  overflow: hidden;
  padding: 1.15rem;
}

.stat-icon {
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  flex: none;
  place-items: center;
  border-radius: 0.85rem;
}

.stat-icon--violet {
  color: #ad94ff;
  border: 1px solid rgba(147, 112, 255, 0.25);
  background: rgba(127, 86, 255, 0.11);
}

.stat-icon--cyan {
  color: var(--color-cyan);
  border: 1px solid rgba(27, 214, 255, 0.23);
  background: rgba(27, 214, 255, 0.08);
}

.stat-icon--pink {
  color: var(--color-magenta);
  border: 1px solid rgba(244, 91, 216, 0.22);
  background: rgba(244, 91, 216, 0.08);
}

.stat-card > div:not(.stat-glow) {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.stat-card strong {
  margin-top: 0.2rem;
  font-size: 1.45rem;
  letter-spacing: -0.03em;
}

.stat-card strong small {
  margin-left: 0.15rem;
  color: var(--color-text-subtle);
  font-size: 0.74rem;
}

.stat-card .stat-date {
  overflow: hidden;
  font-size: 0.98rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-glow {
  position: absolute;
  top: -3rem;
  right: -2rem;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  filter: blur(32px);
  opacity: 0.12;
}

.stat-glow--violet {
  background: #825cff;
}

.stat-glow--cyan {
  background: #19d6ff;
}

.stat-glow--pink {
  background: #f45bd8;
}

.organize-section {
  margin-top: 1rem;
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(9rem, 1fr));
  gap: 0.8rem;
}

.tier-card {
  position: relative;
  display: flex;
  min-height: 19.5rem;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.tier-card:hover {
  z-index: 2;
  border-color: color-mix(in srgb, var(--tier-color) 45%, var(--color-border));
  box-shadow:
    var(--shadow-card),
    0 0 30px color-mix(in srgb, var(--tier-color) 12%, transparent);
  transform: translateY(-5px);
}

.tier-less {
  --tier-color: var(--color-tier-less);
}

.tier-less-medium {
  --tier-color: var(--color-tier-less-medium);
}

.tier-medium {
  --tier-color: var(--color-tier-medium);
}

.tier-more-medium {
  --tier-color: var(--color-tier-more-medium);
}

.tier-more {
  --tier-color: var(--color-tier-more);
}

.tier-card::after {
  position: absolute;
  right: -3rem;
  bottom: 3.5rem;
  width: 9rem;
  height: 9rem;
  content: '';
  border-radius: 50%;
  background: var(--tier-color);
  filter: blur(55px);
  opacity: 0.08;
}

.tier-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-subtle);
  font-size: 0.64rem;
  font-weight: 700;
}

.tier-index {
  color: var(--tier-color);
  letter-spacing: 0.08em;
}

.tier-orbit {
  position: relative;
  display: grid;
  width: 5.3rem;
  height: 5.3rem;
  margin: 1.55rem 0 1.45rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--tier-color) 22%, transparent);
  border-radius: 50%;
}

.tier-orbit::before,
.tier-orbit::after {
  position: absolute;
  content: '';
  border: 1px solid color-mix(in srgb, var(--tier-color) 15%, transparent);
  border-radius: 50%;
}

.tier-orbit::before {
  width: 3.75rem;
  height: 3.75rem;
}

.tier-orbit::after {
  width: 6.2rem;
  height: 2.8rem;
  transform: rotate(-28deg);
}

.tier-orbit span {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--tier-color);
  box-shadow:
    0 0 12px var(--tier-color),
    0 0 28px color-mix(in srgb, var(--tier-color) 70%, transparent);
}

.tier-card-copy {
  position: relative;
  z-index: 1;
}

.tier-card-copy p {
  color: var(--tier-color);
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.tier-card-copy h3 {
  min-height: 2.6rem;
  margin-top: 0.2rem;
  font-size: 0.87rem;
  line-height: 1.35;
}

.tier-card-copy span {
  color: var(--color-text-subtle);
  font-size: 0.68rem;
}

.tier-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.85rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  font-size: 0.72rem;
  font-weight: 700;
}

.tier-card:hover .tier-action {
  color: var(--tier-color);
}

.latest-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.75rem;
  padding: 1rem;
}

.latest-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
  place-items: center;
  color: var(--color-accent-strong);
  border: 1px solid rgba(137, 99, 255, 0.22);
  border-radius: 0.8rem;
  background: rgba(137, 99, 255, 0.09);
}

.latest-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.latest-copy > span,
.latest-copy small {
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.latest-copy strong {
  margin: 0.12rem 0;
  overflow: hidden;
  font-size: 0.9rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.confirmation-range {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--tier-color) 25%, var(--color-border));
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--tier-color) 7%, var(--color-surface));
}

.confirmation-icon {
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  place-items: center;
  color: var(--tier-color);
  border-radius: 0.8rem;
  background: color-mix(in srgb, var(--tier-color) 11%, transparent);
}

.confirmation-range p {
  color: var(--tier-color);
  font-size: 0.72rem;
  font-weight: 700;
}

.confirmation-range strong {
  font-size: 0.92rem;
}

.confirmation-note {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin-top: 0.85rem;
  padding: 0.85rem;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 0.76rem;
}

.confirmation-note :deep(svg) {
  flex: none;
  color: var(--color-success);
}

@media (max-width: 1160px) {
  .tier-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .tier-card {
    min-height: 17rem;
  }
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card:last-child {
    grid-column: 1 / -1;
  }

  .tier-grid {
    grid-template-columns: 1fr 1fr;
  }

  .tier-card {
    min-height: 16rem;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .latest-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .latest-card .button {
    width: 100%;
  }
}

@media (max-width: 430px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card:last-child {
    grid-column: auto;
  }

  .tier-grid {
    grid-template-columns: 1fr;
  }

  .tier-card {
    min-height: 13.5rem;
  }

  .tier-orbit {
    position: absolute;
    top: 3rem;
    right: 1.5rem;
    width: 4.5rem;
    height: 4.5rem;
    opacity: 0.8;
  }

  .tier-card-copy {
    margin-top: 4rem;
  }
}
</style>
