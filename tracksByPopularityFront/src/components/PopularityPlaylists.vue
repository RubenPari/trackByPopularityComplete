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

    <div v-else class="playlists-grid">
      <div
        v-for="item in popularityPlaylists"
        :key="item.tier"
        :class="['playlist-card', `tier-${item.tier}`]"
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

const { t } = useI18n()
const { playlists, loading, forceRefresh } = usePlaylistsWithCache()

const POPULARITY_TIERS = [
  { tier: 'less', names: ['Popularity: 0-20', 'Popularity: Less (0-20)'], icon: '📉' },
  {
    tier: 'less-medium',
    names: ['Popularity: 21-40', 'Popularity: Less Medium (21-40)'],
    icon: '📊',
  },
  { tier: 'medium', names: ['Popularity: 41-60', 'Popularity: Medium (41-60)'], icon: '📈' },
  {
    tier: 'more-medium',
    names: ['Popularity: 61-80', 'Popularity: 41-80', 'Popularity: More Medium (61-80)'],
    icon: '🔥',
  },
  { tier: 'more', names: ['Popularity: 81-100', 'Popularity: More (81-100)'], icon: '⭐' },
] as const

const popularityPlaylists = computed(() => {
  return POPULARITY_TIERS.map((tier) => {
    const playlist = playlists.value.find((p) => tier.names.some((name) => p.name === name))
    if (!playlist) return null
    return {
      tier: tier.tier,
      icon: tier.icon,
      label: t(`tracks.popularity.${tierToKey(tier.tier)}.title`),
      totalTracks: playlist.totalTracks,
    }
  }).filter((item): item is NonNullable<typeof item> => item !== null)
})

function tierToKey(tier: string): string {
  const map: Record<string, string> = {
    less: 'less',
    'less-medium': 'lessMedium',
    medium: 'medium',
    'more-medium': 'moreMedium',
    more: 'more',
  }
  return map[tier] ?? tier
}

onMounted(() => {
  forceRefresh()
})
</script>

<style scoped>
.popularity-playlists {
  margin-top: 2rem;
}

.section-subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.empty-state {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.playlist-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.playlist-card.tier-less {
  border-left: 4px solid var(--color-tier-less);
}
.playlist-card.tier-less-medium {
  border-left: 4px solid var(--color-tier-less-medium);
}
.playlist-card.tier-medium {
  border-left: 4px solid var(--color-tier-medium);
}
.playlist-card.tier-more-medium {
  border-left: 4px solid var(--color-tier-more-medium);
}
.playlist-card.tier-more {
  border-left: 4px solid var(--color-tier-more);
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

@media (max-width: 768px) {
  .playlists-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .playlists-grid {
    grid-template-columns: 1fr;
  }
}
</style>
