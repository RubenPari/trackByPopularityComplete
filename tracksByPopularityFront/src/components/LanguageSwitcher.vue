<script setup lang="ts">
import { Languages } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const { locale, t } = useI18n()

const toggleLocale = (): void => {
  const next = locale.value === 'it' ? 'en' : 'it'
  locale.value = next
  localStorage.setItem('locale', next)
}
</script>

<template>
  <button
    class="language-switcher"
    :class="{ compact }"
    type="button"
    :aria-label="t('language.switchLabel')"
    :title="t('language.switchLabel')"
    @click="toggleLocale"
  >
    <Languages :size="16" aria-hidden="true" />
    <span>{{ locale === 'it' ? 'EN' : 'IT' }}</span>
  </button>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 0.78rem;
  background: var(--color-surface);
  font-size: 0.73rem;
  font-weight: 700;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.language-switcher:hover {
  color: var(--color-text);
  border-color: var(--color-border-strong);
  background: var(--color-surface-hover);
  transform: translateY(-1px);
}

.language-switcher.compact {
  min-width: 2.55rem;
  padding: 0.5rem 0.62rem;
}

.language-switcher.compact :deep(svg) {
  display: none;
}
</style>
