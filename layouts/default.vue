<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col font-sans">
    
    <!-- Navigation Bar (omitted on Auth page) -->
    <Navigation v-if="store.currentView !== 'auth'" />

    <!-- Main Dynamic Page Content -->
    <main class="flex-1 flex flex-col">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useMainStore } from '@/stores/main'
import Navigation from '@/components/Navigation.vue'

const store = useMainStore()
</script>
