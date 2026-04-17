import { useI18n } from 'vue-i18n'
import { VALIDATION } from '@/utils/constants'

/**
 * Composable for form validation utilities
 * Provides reusable validation functions for forms
 */
export function useFormValidation() {
  const { t } = useI18n()
  /**
   * Validates a Spotify ID (artist, track, playlist, etc.)
   * Spotify IDs are exactly 22 alphanumeric characters
   */
  const validateSpotifyId = (id: string): boolean => {
    if (!id || typeof id !== 'string') {
      return false
    }
    return (
      id.trim().length === VALIDATION.SPOTIFY_ID_LENGTH &&
      VALIDATION.SPOTIFY_ID_PATTERN.test(id.trim())
    )
  }

  /**
   * Validates an artist ID specifically
   */
  const validateArtistId = (artistId: string): boolean => {
    return validateSpotifyId(artistId)
  }

  /**
   * Gets validation error message for Spotify ID
   */
  const getSpotifyIdErrorMessage = (): string => {
    return t('validation.invalidSpotifyId', { length: VALIDATION.SPOTIFY_ID_LENGTH })
  }

  return {
    validateSpotifyId,
    validateArtistId,
    getSpotifyIdErrorMessage,
  }
}
