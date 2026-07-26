<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Clock3,
  LayoutDashboard,
  Music2,
  Settings,
  Sparkles,
  UsersRound,
} from '@lucide/vue'
import BrandMark from '@/components/BrandMark.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const { t } = useI18n()

const items = computed(() => [
  { to: '/', label: t('navigation.dashboard'), icon: LayoutDashboard },
  { to: '/artists', label: t('navigation.artists'), icon: UsersRound },
  { to: '/history', label: t('navigation.history'), icon: Clock3 },
  { to: '/settings', label: t('navigation.settings'), icon: Settings },
])

const isActive = (to: string): boolean => route.path === to
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">{{ t('navigation.skipToContent') }}</a>

    <aside class="sidebar">
      <RouterLink to="/" class="brand-link" :aria-label="t('home.title')">
        <BrandMark />
        <span class="brand-copy">
          <strong>Tracks</strong>
          <span>by Popularity</span>
        </span>
      </RouterLink>

      <nav class="sidebar-nav" :aria-label="t('navigation.main')">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" :size="19" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <span v-if="isActive(item.to)" class="nav-indicator" aria-hidden="true"></span>
        </RouterLink>
      </nav>

      <div class="sidebar-card">
        <span class="sidebar-card-icon"><Sparkles :size="17" aria-hidden="true" /></span>
        <p>{{ t('navigation.spotifyConnected') }}</p>
        <span class="status-dot">{{ t('navigation.active') }}</span>
      </div>

      <div class="sidebar-footer">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>
    </aside>

    <div class="app-stage">
      <header class="mobile-header">
        <RouterLink to="/" class="mobile-brand" :aria-label="t('home.title')">
          <BrandMark size="small" />
          <strong>Tracks by Popularity</strong>
        </RouterLink>
        <div class="mobile-header-actions">
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" class="app-content" tabindex="-1">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <nav class="bottom-nav" :aria-label="t('navigation.main')">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="bottom-nav-link"
        :class="{ active: isActive(item.to) }"
      >
        <component :is="item.icon" :size="20" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="ambient ambient-one" aria-hidden="true"></div>
    <div class="ambient ambient-two" aria-hidden="true"></div>
    <Music2 class="ambient-note" :size="120" aria-hidden="true" />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  display: grid;
  grid-template-columns: 16.5rem minmax(0, 1fr);
  min-height: 100dvh;
  overflow: hidden;
  background: var(--color-background);
}

.sidebar {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: 1.35rem 1rem;
  border-right: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-sidebar) 88%, transparent);
  backdrop-filter: blur(24px);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.45rem 0.55rem 1.7rem;
  color: var(--color-text);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.08;
}

.brand-copy strong {
  font-size: 1.02rem;
  letter-spacing: -0.02em;
}

.brand-copy span {
  margin-top: 0.22rem;
  color: var(--color-text-muted);
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 2.9rem;
  padding: 0 0.85rem;
  overflow: hidden;
  color: var(--color-text-muted);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.nav-link.active {
  color: var(--color-text);
  border-color: color-mix(in srgb, var(--color-accent) 25%, transparent);
  background: linear-gradient(100deg, rgba(128, 87, 255, 0.16), rgba(16, 210, 255, 0.05));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.nav-link.active :deep(svg) {
  color: var(--color-cyan);
  filter: drop-shadow(0 0 7px rgba(23, 211, 255, 0.5));
}

.nav-indicator {
  position: absolute;
  right: 0.45rem;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-cyan);
  box-shadow: 0 0 10px var(--color-cyan);
}

.sidebar-card {
  margin-top: auto;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, rgba(29, 185, 84, 0.07), var(--color-surface));
}

.sidebar-card-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.8rem;
  place-items: center;
  color: var(--color-spotify);
  border: 1px solid rgba(29, 185, 84, 0.25);
  border-radius: 0.65rem;
  background: rgba(29, 185, 84, 0.08);
}

.sidebar-card p {
  color: var(--color-text);
  font-size: 0.78rem;
  font-weight: 600;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.45rem;
  color: var(--color-text-subtle);
  font-size: 0.7rem;
}

.status-dot::before {
  width: 0.42rem;
  height: 0.42rem;
  content: '';
  border-radius: 50%;
  background: var(--color-spotify);
  box-shadow: 0 0 8px rgba(29, 185, 84, 0.7);
}

.sidebar-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.9rem 0.35rem 0;
}

.app-stage {
  position: relative;
  z-index: 2;
  min-width: 0;
  height: 100dvh;
  overflow-y: auto;
}

.app-content {
  width: min(100%, 94rem);
  min-height: 100%;
  margin: 0 auto;
  padding: 2.25rem clamp(1.25rem, 3vw, 3.5rem) 4rem;
}

.mobile-header,
.bottom-nav {
  display: none;
}

.ambient {
  position: fixed;
  z-index: 1;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(100px);
  opacity: var(--ambient-opacity);
  animation: ambient-drift 18s ease-in-out infinite alternate;
}

.ambient-one {
  top: -12rem;
  right: 4%;
  width: 34rem;
  height: 24rem;
  background: rgba(115, 72, 255, 0.24);
}

.ambient-two {
  right: 20%;
  bottom: -15rem;
  width: 30rem;
  height: 25rem;
  background: rgba(16, 204, 255, 0.13);
  animation-delay: -7s;
}

.ambient-note {
  position: fixed;
  right: 5%;
  bottom: 4%;
  z-index: 1;
  color: var(--color-text);
  opacity: 0.015;
  transform: rotate(-12deg);
  pointer-events: none;
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes ambient-drift {
  to {
    transform: translate3d(-3rem, 2rem, 0) scale(1.08);
  }
}

@media (max-width: 900px) {
  .app-shell {
    display: block;
    overflow: visible;
  }

  .sidebar {
    display: none;
  }

  .app-stage {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }

  .mobile-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 4.4rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-background) 82%, transparent);
    backdrop-filter: blur(20px);
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--color-text);
    font-size: 0.88rem;
  }

  .mobile-header-actions {
    display: flex;
    gap: 0.4rem;
  }

  .app-content {
    padding: 1.5rem 1rem 6.8rem;
  }

  .bottom-nav {
    position: fixed;
    right: 0.7rem;
    bottom: 0.7rem;
    left: 0.7rem;
    z-index: 30;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.45rem;
    border: 1px solid var(--color-border-strong);
    border-radius: 1.25rem;
    background: color-mix(in srgb, var(--color-surface-solid) 90%, transparent);
    box-shadow: var(--shadow-nav);
    backdrop-filter: blur(22px);
  }

  .bottom-nav-link {
    display: flex;
    min-width: 0;
    min-height: 3.4rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    color: var(--color-text-subtle);
    border-radius: 0.9rem;
    font-size: 0.64rem;
    font-weight: 600;
  }

  .bottom-nav-link.active {
    color: var(--color-text);
    background: rgba(126, 87, 255, 0.14);
  }

  .bottom-nav-link.active :deep(svg) {
    color: var(--color-cyan);
    filter: drop-shadow(0 0 8px rgba(16, 210, 255, 0.45));
  }
}

@media (max-width: 390px) {
  .mobile-brand strong {
    max-width: 7.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
