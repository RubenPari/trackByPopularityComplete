<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="icon-button"
    :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    :title="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" :size="18" aria-hidden="true" />
    <Moon v-else :size="18" aria-hidden="true" />
  </button>
</template>
