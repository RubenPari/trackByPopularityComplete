<template>
  <button class="language-switcher" @click="toggleLocale" :title="t('language.switchLabel')">
    {{ locale === 'it' ? '🇬🇧 EN' : '🇮🇹 IT' }}
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

function toggleLocale() {
  const next = locale.value === 'it' ? 'en' : 'it'
  locale.value = next
  localStorage.setItem('locale', next)
}
</script>

<style scoped>
.language-switcher {
  padding: 0.5rem 1rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text);
}

.language-switcher:hover {
  border-color: var(--color-primary);
  background: var(--color-background-hover);
}
</style>
