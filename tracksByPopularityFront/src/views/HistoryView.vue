<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Clock3,
  Disc3,
  History,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserRound,
} from '@lucide/vue'
import { useHistoryStore } from '@/stores/history'
import { useCatalogStore } from '@/stores/catalog'
import type { PlaylistSnapshot } from '@/types/api'
import BaseDialog from '@/components/BaseDialog.vue'
import NotificationBanner from '@/components/NotificationBanner.vue'

type HistoryFilter = 'all' | 'popularity' | 'artist'
type PendingAction = 'restore' | 'delete'

const { t, locale } = useI18n()
const historyStore = useHistoryStore()
const catalogStore = useCatalogStore()
const activeFilter = ref<HistoryFilter>('all')
const selectedSnapshot = ref<PlaylistSnapshot | null>(null)
const pendingAction = ref<PendingAction>('restore')
const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const filteredSnapshots = computed(() => {
  if (activeFilter.value === 'all') return historyStore.sortedSnapshots
  return historyStore.sortedSnapshots.filter(
    (snapshot) => snapshot.operationType === activeFilter.value,
  )
})

const dialogTitle = computed(() =>
  pendingAction.value === 'restore'
    ? t('historyPage.restoreTitle')
    : t('historyPage.deleteTitle'),
)

const dialogDescription = computed(() =>
  pendingAction.value === 'restore'
    ? t('backup.restoreConfirm', { name: selectedSnapshot.value?.playlistName })
    : t('backup.deleteConfirm', { name: selectedSnapshot.value?.playlistName }),
)

const dialogBusy = computed(
  () =>
    historyStore.restoringId !== null ||
    historyStore.deletingId !== null,
)

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

const openAction = (snapshot: PlaylistSnapshot, action: PendingAction): void => {
  selectedSnapshot.value = snapshot
  pendingAction.value = action
}

const confirmAction = async (): Promise<void> => {
  if (!selectedSnapshot.value) return

  const success =
    pendingAction.value === 'restore'
      ? await historyStore.restoreSnapshot(selectedSnapshot.value.id)
      : await historyStore.deleteSnapshot(selectedSnapshot.value.id)

  if (success && pendingAction.value === 'restore') {
    await catalogStore.refreshPlaylists()
  }

  notification.value = {
    type: success ? 'success' : 'error',
    message: success
      ? pendingAction.value === 'restore'
        ? t('backup.restoreSuccess')
        : t('backup.deleteSuccess')
      : historyStore.error || t('errors.genericError'),
  }

  if (success) selectedSnapshot.value = null
}

onMounted(() => {
  void historyStore.fetchSnapshots()
})
</script>

<template>
  <div class="page history-page">
    <header class="page-heading">
      <div class="page-heading-copy">
        <p class="eyebrow">{{ t('historyPage.eyebrow') }}</p>
        <h1 class="page-title">{{ t('historyPage.title') }}</h1>
        <p class="page-description">{{ t('historyPage.description') }}</p>
      </div>
      <span class="badge">
        <ShieldCheck :size="13" aria-hidden="true" />
        {{ t('historyPage.retention') }}
      </span>
    </header>

    <section class="history-surface surface">
      <div class="history-toolbar">
        <div>
          <h2>{{ t('historyPage.activityTitle') }}</h2>
          <p>{{ t('historyPage.activityDescription') }}</p>
        </div>
        <div class="segmented-control" :aria-label="t('historyPage.filterLabel')">
          <button
            v-for="filter in (['all', 'popularity', 'artist'] as HistoryFilter[])"
            :key="filter"
            type="button"
            class="segment"
            :class="{ active: activeFilter === filter }"
            :aria-pressed="activeFilter === filter"
            @click="activeFilter = filter"
          >
            {{ t(`historyPage.filters.${filter}`) }}
          </button>
        </div>
      </div>

      <div v-if="historyStore.loading" class="history-list" aria-hidden="true">
        <div v-for="index in 5" :key="index" class="history-row skeleton"></div>
      </div>

      <div v-else-if="historyStore.error && historyStore.snapshots.length === 0" class="state-panel">
        <div>
          <span class="state-panel-icon"><History :size="21" /></span>
          <h3>{{ t('common.somethingWentWrong') }}</h3>
          <p>{{ historyStore.error }}</p>
          <button class="button button-secondary state-action" @click="historyStore.fetchSnapshots(true)">
            {{ t('common.retry') }}
          </button>
        </div>
      </div>

      <div v-else-if="filteredSnapshots.length === 0" class="state-panel">
        <div>
          <span class="state-panel-icon"><Clock3 :size="21" /></span>
          <h3>{{ t('backup.noSnapshots') }}</h3>
          <p>{{ t('historyPage.emptyDescription') }}</p>
        </div>
      </div>

      <div v-else class="history-list">
        <article
          v-for="snapshot in filteredSnapshots"
          :key="snapshot.id"
          class="history-row"
        >
          <span
            class="history-icon"
            :class="snapshot.operationType === 'artist' ? 'artist' : 'popularity'"
          >
            <UserRound v-if="snapshot.operationType === 'artist'" :size="18" aria-hidden="true" />
            <Disc3 v-else :size="18" aria-hidden="true" />
          </span>
          <div class="history-copy">
            <strong>{{ snapshot.playlistName }}</strong>
            <div class="history-meta">
              <span>
                {{
                  snapshot.operationType === 'artist'
                    ? t('backup.operationArtist')
                    : t('backup.operationPopularity')
                }}
              </span>
              <i aria-hidden="true"></i>
              <span>{{ t('backup.trackCount', { count: snapshot.trackCount }) }}</span>
              <i aria-hidden="true"></i>
              <time :datetime="snapshot.createdAt">{{ formatDate(snapshot.createdAt) }}</time>
            </div>
          </div>
          <div class="history-actions">
            <button
              type="button"
              class="button button-secondary"
              :disabled="dialogBusy"
              @click="openAction(snapshot, 'restore')"
            >
              <RotateCcw :size="15" aria-hidden="true" />
              {{ t('backup.restore') }}
            </button>
            <button
              type="button"
              class="icon-button delete-button"
              :disabled="dialogBusy"
              :aria-label="t('backup.delete')"
              :title="t('backup.delete')"
              @click="openAction(snapshot, 'delete')"
            >
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </section>

    <BaseDialog
      :open="Boolean(selectedSnapshot)"
      :title="dialogTitle"
      :description="dialogDescription"
      :busy="dialogBusy"
      @close="selectedSnapshot = null"
    >
      <div v-if="selectedSnapshot" class="dialog-body">
        <div class="snapshot-summary">
          <span
            class="history-icon"
            :class="selectedSnapshot.operationType === 'artist' ? 'artist' : 'popularity'"
          >
            <UserRound
              v-if="selectedSnapshot.operationType === 'artist'"
              :size="18"
              aria-hidden="true"
            />
            <Disc3 v-else :size="18" aria-hidden="true" />
          </span>
          <div>
            <strong>{{ selectedSnapshot.playlistName }}</strong>
            <small>
              {{ t('backup.trackCount', { count: selectedSnapshot.trackCount }) }}
              · {{ formatDate(selectedSnapshot.createdAt) }}
            </small>
          </div>
        </div>
      </div>
      <div class="dialog-actions">
        <button
          type="button"
          class="button button-secondary"
          :disabled="dialogBusy"
          @click="selectedSnapshot = null"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="button"
          :class="pendingAction === 'delete' ? 'button-danger' : 'button-primary'"
          :disabled="dialogBusy"
          @click="confirmAction"
        >
          <span v-if="dialogBusy" class="spinner"></span>
          <Trash2 v-else-if="pendingAction === 'delete'" :size="16" aria-hidden="true" />
          <RotateCcw v-else :size="16" aria-hidden="true" />
          {{ pendingAction === 'delete' ? t('backup.delete') : t('backup.restore') }}
        </button>
      </div>
    </BaseDialog>

    <NotificationBanner
      v-if="notification"
      :message="notification.message"
      :type="notification.type"
      @close="notification = null"
    />
  </div>
</template>

<style scoped>
.history-surface {
  overflow: hidden;
}

.history-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.15rem;
  border-bottom: 1px solid var(--color-border);
}

.history-toolbar h2 {
  font-size: 1rem;
}

.history-toolbar p {
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.73rem;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-row {
  display: flex;
  min-height: 5.3rem;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1.15rem;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.18s ease;
}

.history-row:last-child {
  border-bottom: 0;
}

.history-row:hover {
  background: var(--color-surface-hover);
}

.history-icon {
  display: grid;
  width: 2.7rem;
  height: 2.7rem;
  flex: none;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 0.82rem;
}

.history-icon.popularity {
  color: var(--color-cyan);
  border-color: rgba(27, 214, 255, 0.18);
  background: rgba(27, 214, 255, 0.06);
}

.history-icon.artist {
  color: var(--color-magenta);
  border-color: rgba(244, 91, 216, 0.18);
  background: rgba(244, 91, 216, 0.06);
}

.history-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.history-copy strong {
  overflow: hidden;
  font-size: 0.85rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.35rem;
  color: var(--color-text-muted);
  font-size: 0.69rem;
  flex-wrap: wrap;
}

.history-meta i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-subtle);
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.delete-button:hover:not(:disabled) {
  color: var(--color-error);
  border-color: color-mix(in srgb, var(--color-error) 35%, var(--color-border));
  background: color-mix(in srgb, var(--color-error) 7%, var(--color-surface));
}

.state-action {
  margin-top: 1rem;
}

.snapshot-summary {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.snapshot-summary > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.snapshot-summary strong {
  overflow: hidden;
  font-size: 0.85rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snapshot-summary small {
  margin-top: 0.2rem;
  color: var(--color-text-muted);
  font-size: 0.68rem;
}

@media (max-width: 720px) {
  .history-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .segmented-control {
    width: 100%;
  }

  .segment {
    flex: 1;
  }

  .history-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .history-copy {
    padding-top: 0.25rem;
  }

  .history-actions {
    width: 100%;
    padding-left: 3.6rem;
  }

  .history-actions .button {
    flex: 1;
  }
}

@media (max-width: 430px) {
  .history-actions {
    padding-left: 0;
  }
}
</style>
