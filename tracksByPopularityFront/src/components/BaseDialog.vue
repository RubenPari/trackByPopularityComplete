<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    busy?: boolean
  }>(),
  {
    description: '',
    busy: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)

const close = (): void => {
  if (!props.busy) emit('close')
}

const handleCancel = (event: Event): void => {
  event.preventDefault()
  close()
}

watch(
  () => props.open,
  async (open) => {
    await nextTick()
    if (open && dialog.value && !dialog.value.open) dialog.value.showModal()
    if (!open && dialog.value?.open) dialog.value.close()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close()
})
</script>

<template>
  <dialog ref="dialog" class="dialog" @cancel="handleCancel" @close="emit('close')">
    <div class="dialog-glow" aria-hidden="true"></div>
    <div class="dialog-header">
      <div>
        <p class="eyebrow">{{ t('common.confirmAction') }}</p>
        <h2>{{ title }}</h2>
      </div>
      <button
        type="button"
        class="icon-button dialog-close"
        :disabled="busy"
        :aria-label="t('common.close')"
        @click="close"
      >
        <X :size="19" aria-hidden="true" />
      </button>
    </div>
    <p v-if="description" class="dialog-description">{{ description }}</p>
    <slot />
  </dialog>
</template>

<style scoped>
.dialog {
  position: fixed;
  width: min(31rem, calc(100vw - 2rem));
  max-height: min(46rem, calc(100dvh - 2rem));
  margin: auto;
  overflow: auto;
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  background: var(--color-surface-solid);
  box-shadow: var(--shadow-dialog);
}

.dialog::backdrop {
  background: rgba(3, 4, 17, 0.72);
  backdrop-filter: blur(12px);
}

.dialog-glow {
  position: absolute;
  top: -7rem;
  left: 15%;
  width: 16rem;
  height: 11rem;
  border-radius: 999px;
  background: rgba(125, 87, 255, 0.25);
  filter: blur(46px);
  pointer-events: none;
}

.dialog-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.5rem 0;
}

.dialog-header h2 {
  margin-top: 0.25rem;
  font-size: 1.4rem;
}

.dialog-close {
  margin: -0.35rem -0.35rem 0 0;
}

.dialog-description {
  position: relative;
  margin: 0.75rem 1.5rem 0;
  color: var(--color-text-muted);
  line-height: 1.65;
}

:deep(.dialog-body) {
  padding: 1.25rem 1.5rem;
}

:deep(.dialog-actions) {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

@media (max-width: 560px) {
  .dialog {
    width: calc(100vw - 1rem);
    margin-bottom: 0.5rem;
    border-radius: var(--radius-xl);
  }

  :deep(.dialog-actions) {
    flex-direction: column-reverse;
  }

  :deep(.dialog-actions .button) {
    width: 100%;
  }
}
</style>
