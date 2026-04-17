<template>
  <Transition name="slide-down">
    <div v-if="message" :class="['notification', type]">
      <div class="notification-content">
        <span class="icon">{{ type === 'success' ? '✓' : '✕' }}</span>
        <p class="message">{{ message }}</p>
        <button class="close-button" @click="$emit('close')" :aria-label="t('common.close')">
          ×
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  message: string | null
  type: 'success' | 'error'
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  max-width: 500px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: var(--color-success);
  color: white;
}

.notification.error {
  background: var(--color-error);
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  font-size: 1.25rem;
  font-weight: bold;
  flex-shrink: 0;
}

.message {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.close-button {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.close-button:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .notification {
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
}
</style>
