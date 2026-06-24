<template>
  <div class="popularity-playlists">
    <h3 class="section-subtitle">{{ t('popularityPlaylists.sectionTitle') }}</h3>

    <div v-if="loading" class="loading-state">
      <div class="spinner spinner-small"></div>
      <span>{{ t('popularityPlaylists.loading') }}</span>
    </div>

    <div v-else-if="popularityPlaylists.length === 0" class="empty-state">
      {{ t('popularityPlaylists.noPlaylists') }}
    </div>

    <div v-else class="grid grid-cards">
      <div
        v-for="item in popularityPlaylists"
        :key="item.tier"
        :class="['card', 'playlist-card', `tier-${item.tier}`]"
      >
        <span class="card-icon">{{ item.icon }}</span>
        <div class="card-info">
          <span class="card-name">{{ item.label }}</span>
          <span class="card-tracks">{{
            t('popularityPlaylists.trackCount', { count: item.totalTracks })
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlaylistsWithCache } from '@/composables/usePlaylistsWithCache'
import type { PopularityRange } from '@/types/popularity'

const { t } = useI18n()
const { playlists, loading, forceRefresh } = usePlaylistsWithCache()

interface PopularityTier {
  tier: PopularityRange
  names: string[]
  icon: string
}

const POPULARITY_TIERS: PopularityTier[] = [
  { tier: 'less', names: ['Popularity: 0-20', 'Popularity: Less (0-20)'], icon: '📉' },
  {
    tier: 'less-medium',
    names: ['Popularity: 21-40', 'Popularity: Less Medium (21-40)'],
    icon: '📊',
  },
  { tier: 'medium', names: ['Popularity: 41-60', 'Popularity: Medium (41-60)'], icon: '📈' },
  {
    tier: 'more-medium',
    names: ['Popularity: 61-80', 'Popularity: More Medium (61-80)'],
    icon: '🔥',
  },
  { tier: 'more', names: ['Popularity: 81-100', 'Popularity: More (81-100)'], icon: '⭐' },
]

const tierToKey: Record<PopularityRange, string> = {
  less: 'less',
  'less-medium': 'lessMedium',
  medium: 'medium',
  'more-medium': 'moreMedium',
  more: 'more',
}

const popularityPlaylists = computed(() => {
  return POPULARITY_TIERS.map((tier) => {
    const playlist = playlists.value.find((p) => tier.names.some((name) => p.name === name))
    if (!playlist) return null
    return {
      tier: tier.tier,
      icon: tier.icon,
      label: t(`tracks.popularity.${tierToKey[tier.tier]}.title`),
      totalTracks: playlist.totalTracks,
    }
  }).filter((item): item is NonNullable<typeof item> => item !== null)
})

onMounted(() => {
  forceRefresh()
})
</script>

<style scoped>
.popularity-playlists {
  margin-top: 2rem;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 10px;
  padding: 1rem;
  border-left: 4px solid transparent;
}

.playlist-card.tier-less {
  border-left-color: var(--color-tier-less);
}

.playlist-card.tier-less-medium {
  border-left-color: var(--color-tier-less-medium);
}

.playlist-card.tier-medium {
  border-left-color: var(--color-tier-medium);
}

.playlist-card.tier-more-medium {
  border-left-color: var(--color-tier-more-medium);
}

.playlist-card.tier-more {
  border-left-color: var(--color-tier-more);
}

.card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.card-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tracks {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
</style>
