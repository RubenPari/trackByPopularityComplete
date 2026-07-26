import type { PopularityRange } from '@/types/popularity'

export interface PopularityTier {
  id: PopularityRange
  translationKey: 'less' | 'lessMedium' | 'medium' | 'moreMedium' | 'more'
  min: number
  max: number
  playlistNames: string[]
}

export const POPULARITY_TIERS: PopularityTier[] = [
  {
    id: 'less',
    translationKey: 'less',
    min: 0,
    max: 20,
    playlistNames: ['Popularity: 0-20', 'Popularity: Less (0-20)'],
  },
  {
    id: 'less-medium',
    translationKey: 'lessMedium',
    min: 21,
    max: 40,
    playlistNames: ['Popularity: 21-40', 'Popularity: Less Medium (21-40)'],
  },
  {
    id: 'medium',
    translationKey: 'medium',
    min: 41,
    max: 60,
    playlistNames: ['Popularity: 41-60', 'Popularity: Medium (41-60)'],
  },
  {
    id: 'more-medium',
    translationKey: 'moreMedium',
    min: 61,
    max: 80,
    playlistNames: ['Popularity: 61-80', 'Popularity: More Medium (61-80)'],
  },
  {
    id: 'more',
    translationKey: 'more',
    min: 81,
    max: 100,
    playlistNames: ['Popularity: 81-100', 'Popularity: More (81-100)'],
  },
]
