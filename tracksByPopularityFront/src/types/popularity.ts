export type PopularityRange = 'less' | 'less-medium' | 'medium' | 'more-medium' | 'more'

export interface PopularityConfig {
  label: string
  key: string
}

export const POPULARITY_RANGES: PopularityRange[] = [
  'less',
  'less-medium',
  'medium',
  'more-medium',
  'more',
]
