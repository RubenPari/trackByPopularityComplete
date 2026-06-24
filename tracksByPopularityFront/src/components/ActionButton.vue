<template>
  <button
    class="action-button"
    :class="tierClass"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="emit('click')"
  >
    <div class="button-content">
      <div v-if="!loading" class="icon" aria-hidden="true">
        <slot name="icon"></slot>
      </div>
      <div v-else class="spinner spinner-large" aria-hidden="true"></div>
      <div class="text-content">
        <h3 class="title">
          <slot name="title"></slot>
        </h3>
        <p class="description">
          <slot name="description"></slot>
        </p>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PopularityRange } from '@/types/popularity'

/**
 * A reusable action button component that supports different tiers, loading states, and disabled states.
 * It uses slots for icon, title, and description to allow flexible content.
 *
 * @prop {boolean} [loading=false] - Indicates if the button is in a loading state.
 * @prop {boolean} [disabled=false] - Indicates if the button is disabled.
 * @prop {PopularityRange} [tier] - The visual tier of the button for styling.
 * @emits {click} - Emitted when the button is clicked.
 */
const props = defineProps<{
  loading?: boolean
  disabled?: boolean
  tier?: PopularityRange
}>()

const emit = defineEmits<{
  click: []
}>()

const tierClass = computed(() => (props.tier ? `tier-${props.tier}` : ''))
</script>

<style scoped>
.action-button {
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.action-button:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-background-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.tier-less {
  border-color: var(--color-tier-less);
}
.action-button.tier-less:hover:not(:disabled) {
  border-color: var(--color-tier-less);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
}

.action-button.tier-less-medium {
  border-color: var(--color-tier-less-medium);
}
.action-button.tier-less-medium:hover:not(:disabled) {
  border-color: var(--color-tier-less-medium);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.25);
}

.action-button.tier-medium {
  border-color: var(--color-tier-medium);
}
.action-button.tier-medium:hover:not(:disabled) {
  border-color: var(--color-tier-medium);
  box-shadow: 0 4px 16px rgba(234, 179, 8, 0.25);
}

.action-button.tier-more-medium {
  border-color: var(--color-tier-more-medium);
}
.action-button.tier-more-medium:hover:not(:disabled) {
  border-color: var(--color-tier-more-medium);
  box-shadow: 0 4px 16px rgba(132, 204, 22, 0.25);
}

.action-button.tier-more {
  border-color: var(--color-tier-more);
}
.action-button.tier-more:hover:not(:disabled) {
  border-color: var(--color-tier-more);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.25);
}

.button-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.spinner {
  flex-shrink: 0;
}

.text-content {
  flex: 1;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.description {
  font-size: 0.9rem;
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
