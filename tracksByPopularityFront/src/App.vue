<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>

<style>
:root {
  --color-background: #fafbfc;
  --color-background-soft: #ffffff;
  --color-background-hover: #f0f4ff;
  --color-background-mute: #f5f7fa;
  --color-border: #e2e8f0;
  --color-border-hover: #cbd5e1;
  --color-heading: #1e293b;
  --color-text: #334155;
  --color-text-secondary: #64748b;
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;

  --color-tier-less: #ef4444;
  --color-tier-less-medium: #f97316;
  --color-tier-medium: #eab308;
  --color-tier-more-medium: #84cc16;
  --color-tier-more: #a855f7;

  --gradient-primary: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  --gradient-tier-less: linear-gradient(135deg, #ef4444, #f97316);
  --gradient-tier-less-medium: linear-gradient(135deg, #f97316, #eab308);
  --gradient-tier-medium: linear-gradient(135deg, #eab308, #84cc16);
  --gradient-tier-more-medium: linear-gradient(135deg, #84cc16, #22c55e);
  --gradient-tier-more: linear-gradient(135deg, #a855f7, #6366f1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1b26;
    --color-background-soft: #24253a;
    --color-background-hover: #2d2e47;
    --color-background-mute: #1f2033;
    --color-border: #3b3d5c;
    --color-border-hover: #5a5d7a;
    --color-heading: #f1f5f9;
    --color-text: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-primary: #818cf8;
    --color-primary-hover: #6366f1;
    --color-success: #34d399;
    --color-error: #f87171;
    --color-warning: #fbbf24;
    --color-info: #60a5fa;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  color: var(--color-text);
  background: var(--color-background);
  transition:
    color 0.5s,
    background-color 0.5s;
  line-height: 1.6;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--color-primary-hover);
}
</style>
