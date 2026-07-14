<template>
  <div class="min-h-screen flex items-center justify-center bg-brand-dark px-4 py-12 relative overflow-hidden">
    <!-- Cyber decoration circles -->
    <div class="absolute w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[120px] top-[-10%] left-[-10%]"></div>
    <div class="absolute w-[500px] h-[500px] rounded-full bg-brand-secondary/10 blur-[120px] bottom-[-10%] right-[-10%]"></div>

    <div class="w-full max-w-md glass-panel p-8 relative z-10">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2 mb-4">
          <span class="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            AzamjonBro Lab
          </span>
        </router-link>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
// Minimal auth layout wrapper
</script>
