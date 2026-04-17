<template>
  <div class="playlist-selector">
    <label :for="inputId" class="playlist-label">
      {{ displayLabel }}
      <span v-if="required" class="required">*</span>
    </label>
    <div class="select-wrapper">
      <select
        :id="inputId"
        :value="modelValue"
        :disabled="loading || disabled"
        @change="handleChange"
        class="playlist-select"
        :class="{ 'has-error': hasError }"
      >
        <option value="" disabled>{{ displayPlaceholder }}</option>
        <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id">
          {{ playlist.name }} ({{ t('playlist.trackCount', { count: playlist.totalTracks }) }})
        </option>
      </select>
      <button
        v-if="showRefresh"
        @click="refreshPlaylists"
        :disabled="loading"
        class="refresh-button"
        type="button"
        :title="t('playlist.refreshTitle')"
      >
        🔄
      </button>
    </div>
    <p v-if="hasError" class="error-message">{{ errorMessage }}</p>
    <p v-if="loading" class="loading-message">{{ t('playlist.loadingMessage') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlaylistsWithCache } from '@/composables/usePlaylistsWithCache'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  showRefresh?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  required: false,
  disabled: false,
  showRefresh: true,
  errorMessage: '',
})

const { t } = useI18n()
const displayLabel = computed(() => props.label || t('playlist.defaultLabel'))
const displayPlaceholder = computed(() => props.placeholder || t('playlist.defaultPlaceholder'))

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { playlists, loading, forceRefresh } = usePlaylistsWithCache()

const inputId = `playlist-select-${Math.random().toString(36).substr(2, 9)}`
const hasError = computed(() => !!props.errorMessage)

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

const refreshPlaylists = async () => {
  await forceRefresh()
}

onMounted(() => {
  if (playlists.value.length === 0) {
    forceRefresh()
  }
})
</script>

<style scoped>
.playlist-selector {
  width: 100%;
  margin-bottom: 1rem;
}

.playlist-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.select-wrapper {
  position: relative;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.playlist-select {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-select:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.playlist-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

.playlist-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.playlist-select.has-error {
  border-color: #ef4444;
}

.refresh-button {
  padding: 0.75rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
}

.refresh-button:hover:not(:disabled) {
  background: var(--color-background-hover);
  border-color: var(--color-primary);
  transform: rotate(180deg);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.loading-message {
  margin-top: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
