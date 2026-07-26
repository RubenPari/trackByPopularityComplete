<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  CheckCircle2,
  Languages,
  LogOut,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme, type Theme } from '@/composables/useTheme'
import BaseDialog from '@/components/BaseDialog.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { theme, setTheme } = useTheme()
const showLogout = ref(false)
const loggingOut = ref(false)

const setLocale = (value: 'it' | 'en'): void => {
  locale.value = value
  localStorage.setItem('locale', value)
}

const selectTheme = (value: Theme): void => {
  setTheme(value)
}

const handleLogout = async (): Promise<void> => {
  loggingOut.value = true
  await authStore.logout()
  await router.push('/login')
  loggingOut.value = false
}
</script>

<template>
  <div class="page settings-page">
    <header class="page-heading">
      <div class="page-heading-copy">
        <p class="eyebrow">{{ t('settingsPage.eyebrow') }}</p>
        <h1 class="page-title">{{ t('settings.title') }}</h1>
        <p class="page-description">{{ t('settingsPage.description') }}</p>
      </div>
    </header>

    <div class="settings-grid">
      <section class="settings-card surface">
        <div class="settings-card-icon"><Palette :size="20" aria-hidden="true" /></div>
        <div class="settings-copy">
          <h2>{{ t('settingsPage.appearance') }}</h2>
          <p>{{ t('settingsPage.appearanceDescription') }}</p>
        </div>
        <div class="segmented-control setting-control" :aria-label="t('settingsPage.appearance')">
          <button
            type="button"
            class="segment"
            :class="{ active: theme === 'dark' }"
            :aria-pressed="theme === 'dark'"
            @click="selectTheme('dark')"
          >
            <Moon :size="15" aria-hidden="true" />
            {{ t('settingsPage.dark') }}
          </button>
          <button
            type="button"
            class="segment"
            :class="{ active: theme === 'light' }"
            :aria-pressed="theme === 'light'"
            @click="selectTheme('light')"
          >
            <Sun :size="15" aria-hidden="true" />
            {{ t('settingsPage.light') }}
          </button>
        </div>
      </section>

      <section class="settings-card surface">
        <div class="settings-card-icon settings-card-icon--cyan">
          <Languages :size="20" aria-hidden="true" />
        </div>
        <div class="settings-copy">
          <h2>{{ t('settingsPage.language') }}</h2>
          <p>{{ t('settingsPage.languageDescription') }}</p>
        </div>
        <div class="segmented-control setting-control" :aria-label="t('settingsPage.language')">
          <button
            type="button"
            class="segment"
            :class="{ active: locale === 'it' }"
            :aria-pressed="locale === 'it'"
            @click="setLocale('it')"
          >
            IT
          </button>
          <button
            type="button"
            class="segment"
            :class="{ active: locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="setLocale('en')"
          >
            EN
          </button>
        </div>
      </section>

      <section class="account-card surface">
        <div class="account-top">
          <div class="spotify-symbol" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div class="account-copy">
            <p class="eyebrow">{{ t('settings.spotifyAccount') }}</p>
            <h2>Spotify</h2>
            <span class="connected-status">
              <CheckCircle2 :size="14" aria-hidden="true" />
              {{ t('settings.linked') }}
            </span>
          </div>
          <ShieldCheck class="account-shield" :size="24" aria-hidden="true" />
        </div>
        <p class="account-description">{{ t('settingsPage.spotifyDescription') }}</p>
      </section>

      <section class="danger-card surface">
        <div>
          <h2>{{ t('settings.dangerZone') }}</h2>
          <p>{{ t('settingsPage.logoutDescription') }}</p>
        </div>
        <button type="button" class="button button-danger" @click="showLogout = true">
          <LogOut :size="16" aria-hidden="true" />
          {{ t('settings.logout') }}
        </button>
      </section>
    </div>

    <BaseDialog
      :open="showLogout"
      :title="t('settingsPage.logoutTitle')"
      :description="t('settingsPage.logoutConfirm')"
      :busy="loggingOut"
      @close="showLogout = false"
    >
      <div class="dialog-body">
        <div class="logout-note">
          <ShieldCheck :size="18" aria-hidden="true" />
          <span>{{ t('settingsPage.logoutNote') }}</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button
          type="button"
          class="button button-secondary"
          :disabled="loggingOut"
          @click="showLogout = false"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="button button-danger"
          :disabled="loggingOut"
          @click="handleLogout"
        >
          <span v-if="loggingOut" class="spinner"></span>
          <LogOut v-else :size="16" aria-hidden="true" />
          {{ t('settings.logout') }}
        </button>
      </div>
    </BaseDialog>
  </div>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.settings-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
}

.settings-card-icon {
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  place-items: center;
  color: var(--color-accent-strong);
  border: 1px solid rgba(137, 99, 255, 0.22);
  border-radius: 0.85rem;
  background: rgba(137, 99, 255, 0.08);
}

.settings-card-icon--cyan {
  color: var(--color-cyan);
  border-color: rgba(27, 214, 255, 0.22);
  background: rgba(27, 214, 255, 0.07);
}

.settings-copy h2,
.danger-card h2 {
  font-size: 0.95rem;
}

.settings-copy p,
.danger-card p {
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.account-card {
  position: relative;
  min-height: 14rem;
  overflow: hidden;
  padding: 1.35rem;
  background:
    radial-gradient(circle at 85% 0%, rgba(29, 185, 84, 0.12), transparent 40%),
    var(--color-surface);
}

.account-top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.spotify-symbol {
  display: flex;
  width: 3.3rem;
  height: 3.3rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.22rem;
  border-radius: 50%;
  background: #1db954;
  box-shadow: 0 0 30px rgba(29, 185, 84, 0.2);
}

.spotify-symbol span {
  width: 1.65rem;
  height: 0.33rem;
  border-top: 2px solid #07140b;
  border-radius: 50%;
}

.spotify-symbol span:nth-child(2) {
  width: 1.45rem;
}

.spotify-symbol span:nth-child(3) {
  width: 1.2rem;
}

.account-copy h2 {
  margin-top: 0.15rem;
  font-size: 1.2rem;
}

.connected-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.25rem;
  color: var(--color-success);
  font-size: 0.7rem;
  font-weight: 700;
}

.account-shield {
  margin-left: auto;
  color: var(--color-text-subtle);
}

.account-description {
  max-width: 29rem;
  margin-top: 1.2rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  line-height: 1.6;
}

.danger-card {
  display: flex;
  min-height: 14rem;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.35rem;
  border-color: color-mix(in srgb, var(--color-error) 17%, var(--color-border));
  background:
    radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--color-error) 8%, transparent), transparent 42%),
    var(--color-surface);
}

.logout-note {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 0.75rem;
}

.logout-note :deep(svg) {
  flex: none;
  color: var(--color-success);
}

@media (max-width: 940px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 580px) {
  .settings-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .setting-control {
    grid-column: 1 / -1;
    width: 100%;
  }

  .setting-control .segment {
    flex: 1;
  }

  .danger-card {
    min-height: 12rem;
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
