<template>
  <button
    class="action-button"
    :class="tierClass"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <div class="button-content">
      <div class="icon" v-if="!loading">
        <slot name="icon"></slot>
      </div>
      <div class="spinner spinner-large" v-else></div>
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
const props = defineProps<{
  loading?: boolean
  disabled?: boolean
  tier?: 'less' | 'less-medium' | 'medium' | 'more-medium' | 'more'
}>()

defineEmits<{
  click: []
}>()

const tierClass = computed(() => (props.tier ? `tier-${props.tier}` : ''))
</script>

<script lang="ts">
import { computed } from 'vue'
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
