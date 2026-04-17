<template>
  <div class="track-actions">
    <h2 class="section-title">{{ t('tracks.sectionTitle') }}</h2>
    <p class="section-description">
      {{ t('tracks.sectionDescription') }}
    </p>

    <div class="actions-grid">
      <ActionButton
        v-for="config in popularityConfigs"
        :key="config.id"
        :tier="config.id"
        :loading="loading"
        :disabled="loading"
        @click="handleAddTracks(config.id)"
      >
        <template #icon>{{ config.icon }}</template>
        <template #title>
          <span :class="['tier-label', `tier-label-${config.id}`]">{{ config.title }}</span>
        </template>
        <template #description>{{ config.description }}</template>
      </ActionButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTrackActions } from '@/composables/useTrackActions'
import { SUCCESS_MESSAGES } from '@/utils/constants'
import ActionButton from './ActionButton.vue'

const { t } = useI18n()
const { addTracksByPopularity, loading } = useTrackActions()

type PopularityCategoryId = 'less' | 'less-medium' | 'medium' | 'more-medium' | 'more'

interface PopularityConfig {
  id: PopularityCategoryId
  icon: string
  title: string
  description: string
  successMessageKey: string
}

const popularityConfigs = computed<PopularityConfig[]>(() => [
  {
    id: 'less',
    icon: '📉',
    title: t('tracks.popularity.less.title'),
    description: t('tracks.popularity.less.description'),
    successMessageKey: SUCCESS_MESSAGES.TRACKS_ADDED_LESS,
  },
  {
    id: 'less-medium',
    icon: '📊',
    title: t('tracks.popularity.lessMedium.title'),
    description: t('tracks.popularity.lessMedium.description'),
    successMessageKey: SUCCESS_MESSAGES.TRACKS_ADDED_LESS_MEDIUM,
  },
  {
    id: 'medium',
    icon: '📈',
    title: t('tracks.popularity.medium.title'),
    description: t('tracks.popularity.medium.description'),
    successMessageKey: SUCCESS_MESSAGES.TRACKS_ADDED_MEDIUM,
  },
  {
    id: 'more-medium',
    icon: '🔥',
    title: t('tracks.popularity.moreMedium.title'),
    description: t('tracks.popularity.moreMedium.description'),
    successMessageKey: SUCCESS_MESSAGES.TRACKS_ADDED_MORE_MEDIUM,
  },
  {
    id: 'more',
    icon: '⭐',
    title: t('tracks.popularity.more.title'),
    description: t('tracks.popularity.more.description'),
    successMessageKey: SUCCESS_MESSAGES.TRACKS_ADDED_MORE,
  },
])

const handleAddTracks = async (id: PopularityCategoryId) => {
  const config = popularityConfigs.value.find((c) => c.id === id)
  if (!config) return

  await addTracksByPopularity(id, config.successMessageKey)
}
</script>

<style scoped>
.track-actions {
  width: 100%;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.section-description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.tier-label {
  font-weight: 700;
}

.tier-label-less {
  color: var(--color-tier-less);
}

.tier-label-less-medium {
  color: var(--color-tier-less-medium);
}

.tier-label-medium {
  color: var(--color-tier-medium);
}

.tier-label-more-medium {
  color: var(--color-tier-more-medium);
}

.tier-label-more {
  color: var(--color-tier-more);
}
</style>
