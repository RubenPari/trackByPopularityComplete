<script setup lang="ts">
import { CheckCircle2, CircleAlert, X } from '@lucide/vue'
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

<template>
  <Transition name="toast">
    <div v-if="message" :class="['notification', type]" role="status" aria-live="polite">
      <span class="notification-icon">
        <CheckCircle2 v-if="type === 'success'" :size="19" aria-hidden="true" />
        <CircleAlert v-else :size="19" aria-hidden="true" />
      </span>
      <p>{{ message }}</p>
      <button type="button" :aria-label="t('common.close')" @click="$emit('close')">
        <X :size="17" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.notification {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 1100;
  display: flex;
  width: min(26rem, calc(100vw - 2rem));
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem;
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface-solid) 92%, transparent);
  box-shadow: var(--shadow-dialog);
  backdrop-filter: blur(20px);
}

.notification-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: none;
  place-items: center;
  border-radius: 0.65rem;
}

.success .notification-icon {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
}

.error .notification-icon {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
}

.notification p {
  flex: 1;
  font-size: 0.76rem;
  line-height: 1.45;
}

.notification button {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: none;
  place-items: center;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: 0.6rem;
  background: transparent;
}

.notification button:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 900px) {
  .notification {
    bottom: 5.7rem;
  }
}
</style>
