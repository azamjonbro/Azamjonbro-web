<template>
  <div class="text-center py-24 space-y-6">
    <div class="text-6xl font-black text-brand-primary animate-pulse">404</div>
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-white">Resource Not Found</h2>
      <p class="text-xs text-slate-400">The path you requested is either private or does not exist inside our sandbox.</p>
    </div>
    <router-link to="/" class="inline-flex items-center gap-2 text-xs font-bold text-brand-primary border border-brand-primary/20 bg-brand-primary/5 hover:bg-brand-primary/10 px-4 py-2 rounded-lg transition-all">
      Return Home &rarr;
    </router-link>
  </div>
</template>

<script setup lang="ts">
// Basic error template
</script>
