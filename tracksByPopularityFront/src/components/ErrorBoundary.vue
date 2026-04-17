<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <h2 class="error-title">⚠️ {{ t('common.somethingWentWrong') }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <button @click="resetError" class="retry-button">{{ t('common.retry') }}</button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * ErrorBoundary Component
 *
 * A Vue component that acts as an error boundary, catching unhandled errors
 * from child components and displaying a user-friendly error message.
 * This prevents the entire application from crashing when an error occurs.
 *
 * @component
 * @example
 * ```vue
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

const { t } = useI18n()

/** Reactive state indicating if an error has been caught */
const hasError = ref(false)

/** Reactive state containing the error message to display */
const errorMessage = ref<string>('')

/**
 * Error handler that catches errors from child components.
 * This is Vue's equivalent of React's Error Boundary.
 *
 * @param err - The error that was caught (can be any type)
 * @returns {boolean} Returns false to prevent the error from propagating further
 */
onErrorCaptured((err: unknown) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : t('common.unexpectedError')

  // Log error for debugging
  console.error('Error caught by boundary:', err)

  // Return false to prevent the error from propagating further
  return false
})

/**
 * Resets the error state, allowing the component to try rendering again.
 * This is called when the user clicks the "Riprova" (Retry) button.
 */
const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.error-message {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
