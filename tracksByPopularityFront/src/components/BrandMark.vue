<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    size: 'medium',
  },
)
</script>

<template>
  <span class="brand-mark" :class="`brand-mark--${size}`" aria-hidden="true">
    <span class="brand-orbit brand-orbit--one"></span>
    <span class="brand-orbit brand-orbit--two"></span>
    <span class="brand-core"></span>
  </span>
</template>

<style scoped>
.brand-mark {
  position: relative;
  display: inline-grid;
  flex: none;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-accent) 38%, transparent);
  border-radius: 30%;
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.3), transparent 25%),
    linear-gradient(145deg, rgba(128, 92, 255, 0.78), rgba(17, 213, 255, 0.25));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 0 28px rgba(121, 87, 255, 0.28);
  transform: rotate(8deg);
}

.brand-mark--small {
  width: 2rem;
  height: 2rem;
}

.brand-mark--medium {
  width: 2.75rem;
  height: 2.75rem;
}

.brand-mark--large {
  width: 4.5rem;
  height: 4.5rem;
}

.brand-core {
  width: 22%;
  aspect-ratio: 1;
  border-radius: 999px;
  background: white;
  box-shadow:
    0 0 12px white,
    0 0 28px var(--color-cyan);
}

.brand-orbit {
  position: absolute;
  width: 62%;
  height: 24%;
  border: 1.5px solid rgba(255, 255, 255, 0.82);
  border-radius: 999px;
}

.brand-orbit--one {
  transform: rotate(36deg);
}

.brand-orbit--two {
  transform: rotate(-36deg);
}
</style>
