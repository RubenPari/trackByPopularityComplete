<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Headphones, Layers3, ShieldCheck, Sparkles } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import BrandMark from '@/components/BrandMark.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)

const handleSpotifyLogin = async (): Promise<void> => {
  loading.value = true
  error.value = null

  try {
    await authStore.redirectToSpotifyLogin()
  } catch (loginError) {
    error.value =
      loginError instanceof Error ? loginError.message : t('auth.spotifyLoginFailed')
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-aurora login-aurora--one" aria-hidden="true"></div>
    <div class="login-aurora login-aurora--two" aria-hidden="true"></div>
    <div class="login-grid" aria-hidden="true"></div>

    <header class="login-header">
      <div class="login-brand">
        <BrandMark size="small" />
        <span>
          <strong>Tracks</strong>
          <small>by Popularity</small>
        </span>
      </div>
      <div class="login-tools">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>
    </header>

    <div class="login-layout">
      <section class="login-hero">
        <span class="login-pill">
          <Sparkles :size="14" aria-hidden="true" />
          {{ t('loginPage.pill') }}
        </span>
        <h1>
          {{ t('loginPage.titleStart') }}
          <span>{{ t('loginPage.titleAccent') }}</span>
        </h1>
        <p>{{ t('loginPage.description') }}</p>

        <div class="feature-list">
          <div>
            <span><Layers3 :size="18" aria-hidden="true" /></span>
            <p>
              <strong>{{ t('loginPage.featureOrganize') }}</strong>
              <small>{{ t('loginPage.featureOrganizeDescription') }}</small>
            </p>
          </div>
          <div>
            <span><ShieldCheck :size="18" aria-hidden="true" /></span>
            <p>
              <strong>{{ t('loginPage.featureSafe') }}</strong>
              <small>{{ t('loginPage.featureSafeDescription') }}</small>
            </p>
          </div>
        </div>
      </section>

      <section class="login-card surface">
        <div class="login-card-visual" aria-hidden="true">
          <span class="visual-ring visual-ring--outer"></span>
          <span class="visual-ring visual-ring--inner"></span>
          <span class="visual-core"><Headphones :size="28" /></span>
          <i class="visual-dot visual-dot--one"></i>
          <i class="visual-dot visual-dot--two"></i>
        </div>

        <div class="login-card-copy">
          <p class="eyebrow">{{ t('loginPage.cardEyebrow') }}</p>
          <h2>{{ t('auth.loginTitle') }}</h2>
          <p>{{ t('auth.loginDescription') }}</p>
        </div>

        <div v-if="error" class="alert alert-error" role="alert">
          {{ error }}
        </div>

        <button
          type="button"
          class="button button-spotify login-button"
          :disabled="loading"
          @click="handleSpotifyLogin"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else class="spotify-icon" aria-hidden="true">
            <i></i><i></i><i></i>
          </span>
          {{ loading ? t('common.loading') : t('auth.loginWithSpotify') }}
        </button>

        <p class="privacy-note">
          <ShieldCheck :size="13" aria-hidden="true" />
          {{ t('loginPage.privacy') }}
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--color-background);
}

.login-header {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 76rem);
  margin: 0 auto;
  padding: 1.35rem 1.5rem;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.login-brand > span {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.login-brand strong {
  font-size: 0.9rem;
}

.login-brand small {
  color: var(--color-text-muted);
  font-size: 0.63rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.login-tools {
  display: flex;
  gap: 0.45rem;
}

.login-layout {
  position: relative;
  z-index: 4;
  display: grid;
  width: min(100%, 76rem);
  min-height: calc(100dvh - 5.25rem);
  grid-template-columns: minmax(0, 1.2fr) minmax(20rem, 0.72fr);
  align-items: center;
  gap: clamp(2rem, 8vw, 7rem);
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
}

.login-hero {
  max-width: 39rem;
}

.login-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.7rem;
  color: var(--color-cyan);
  border: 1px solid rgba(27, 214, 255, 0.2);
  border-radius: 999px;
  background: rgba(27, 214, 255, 0.06);
  font-size: 0.68rem;
  font-weight: 700;
}

.login-hero h1 {
  margin-top: 1.3rem;
  font-size: clamp(3.2rem, 7vw, 5.75rem);
  line-height: 0.98;
  letter-spacing: -0.075em;
}

.login-hero h1 span {
  display: block;
  color: transparent;
  background: linear-gradient(90deg, #a185ff, #25d7ff 50%, #f167d5);
  background-clip: text;
  -webkit-background-clip: text;
}

.login-hero > p {
  max-width: 33rem;
  margin-top: 1.4rem;
  color: var(--color-text-muted);
  font-size: 0.98rem;
  line-height: 1.7;
}

.feature-list {
  display: flex;
  gap: 1.75rem;
  margin-top: 2rem;
}

.feature-list > div {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
}

.feature-list > div > span {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  flex: none;
  place-items: center;
  color: var(--color-accent-strong);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
}

.feature-list p {
  display: flex;
  flex-direction: column;
}

.feature-list strong {
  font-size: 0.78rem;
}

.feature-list small {
  max-width: 10rem;
  margin-top: 0.15rem;
  color: var(--color-text-muted);
  font-size: 0.65rem;
  line-height: 1.45;
}

.login-card {
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-dialog);
}

.login-card::before {
  position: absolute;
  top: -7rem;
  left: 12%;
  width: 16rem;
  height: 12rem;
  content: '';
  border-radius: 50%;
  background: rgba(126, 85, 255, 0.22);
  filter: blur(45px);
}

.login-card-visual {
  position: relative;
  display: grid;
  width: 9rem;
  height: 9rem;
  margin: 0.7rem auto 2rem;
  place-items: center;
}

.visual-ring {
  position: absolute;
  border: 1px solid rgba(148, 116, 255, 0.28);
  border-radius: 50%;
}

.visual-ring--outer {
  width: 8.5rem;
  height: 8.5rem;
}

.visual-ring--inner {
  width: 6.1rem;
  height: 6.1rem;
  border-color: rgba(27, 214, 255, 0.21);
}

.visual-core {
  display: grid;
  width: 4.2rem;
  height: 4.2rem;
  place-items: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1.35rem;
  background: linear-gradient(145deg, #8b63ff, #432196);
  box-shadow:
    0 0 25px rgba(132, 89, 255, 0.45),
    0 0 65px rgba(27, 214, 255, 0.12);
  transform: rotate(8deg);
}

.visual-dot {
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.visual-dot--one {
  top: 1.1rem;
  right: 1.25rem;
  background: var(--color-cyan);
  box-shadow: 0 0 12px var(--color-cyan);
}

.visual-dot--two {
  bottom: 0.9rem;
  left: 2rem;
  background: var(--color-magenta);
  box-shadow: 0 0 12px var(--color-magenta);
}

.login-card-copy {
  position: relative;
  text-align: center;
}

.login-card-copy h2 {
  margin-top: 0.3rem;
  font-size: 1.55rem;
  letter-spacing: -0.04em;
}

.login-card-copy > p:last-child {
  max-width: 18rem;
  margin: 0.6rem auto 0;
  color: var(--color-text-muted);
  font-size: 0.77rem;
  line-height: 1.6;
}

.login-card .alert {
  margin-top: 1.25rem;
}

.login-button {
  width: 100%;
  min-height: 3.2rem;
  margin-top: 1.4rem;
}

.spotify-icon {
  display: flex;
  width: 1.25rem;
  height: 1.25rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.08rem;
  border-radius: 50%;
  background: white;
}

.spotify-icon i {
  width: 0.75rem;
  height: 0.18rem;
  border-top: 1.5px solid #149846;
  border-radius: 50%;
}

.spotify-icon i:nth-child(2) {
  width: 0.65rem;
}

.spotify-icon i:nth-child(3) {
  width: 0.52rem;
}

.privacy-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.9rem;
  color: var(--color-text-subtle);
  font-size: 0.62rem;
}

.login-aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  opacity: var(--ambient-opacity);
  animation: login-float 17s ease-in-out infinite alternate;
}

.login-aurora--one {
  top: -20rem;
  right: -12rem;
  width: 46rem;
  height: 43rem;
  background: rgba(116, 71, 255, 0.2);
}

.login-aurora--two {
  bottom: -22rem;
  left: -10rem;
  width: 42rem;
  height: 38rem;
  background: rgba(16, 210, 255, 0.12);
  animation-delay: -6s;
}

.login-grid {
  position: absolute;
  inset: 0;
  opacity: 0.13;
  background-image:
    linear-gradient(var(--color-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
  background-size: 68px 68px;
  mask-image: radial-gradient(circle at 55% 50%, black, transparent 72%);
}

@keyframes login-float {
  to {
    transform: translate3d(4rem, 2rem, 0) scale(1.1);
  }
}

@media (max-width: 860px) {
  .login-layout {
    max-width: 37rem;
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .login-hero {
    text-align: center;
  }

  .login-hero > p {
    margin-right: auto;
    margin-left: auto;
  }

  .login-pill {
    margin: 0 auto;
  }

  .feature-list {
    justify-content: center;
    text-align: left;
  }
}

@media (max-width: 540px) {
  .login-header {
    padding: 1rem;
  }

  .login-layout {
    padding: 2rem 1rem 3rem;
  }

  .login-hero h1 {
    font-size: clamp(2.9rem, 16vw, 4.5rem);
  }

  .feature-list {
    flex-direction: column;
    align-items: center;
  }

  .feature-list > div {
    width: 15rem;
  }
}
</style>
