import { computed, ref } from 'vue'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'theme'

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}
const theme = ref<Theme>(getStoredTheme())

function applyTheme(value: Theme): void {
  document.documentElement.dataset.theme = value
  document.documentElement.style.colorScheme = value
}

applyTheme(theme.value)

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (value: Theme): void => {
    theme.value = value
    localStorage.setItem(THEME_STORAGE_KEY, value)
    applyTheme(value)
  }

  const toggleTheme = (): void => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
