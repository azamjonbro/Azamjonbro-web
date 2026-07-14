<template>
  <div class="min-h-screen bg-brand-dark flex text-slate-200">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-brand-border bg-slate-900/60 backdrop-blur-md flex flex-col justify-between p-6">
      <div class="flex flex-col gap-8">
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-brand-secondary flex items-center justify-center font-bold text-white shadow-md">
            A
          </div>
          <span class="text-lg font-bold">Admin Portal</span>
        </router-link>

        <nav class="flex flex-col gap-2">
          <router-link to="/admin" class="admin-sidebar-link">
            Dashboard
          </router-link>
          <router-link to="/" class="admin-sidebar-link">
            Return to Site
          </router-link>
        </nav>
      </div>

      <div class="flex items-center gap-3 border-t border-brand-border pt-4">
        <img :src="authStore.user?.avatar_url" class="w-9 h-9 rounded-full border border-brand-secondary" />
        <div class="truncate">
          <p class="text-sm font-semibold truncate">{{ authStore.user?.full_name || 'Admin User' }}</p>
          <span class="text-[10px] text-brand-secondary font-bold uppercase tracking-wider">System Admin</span>
        </div>
      </div>
    </aside>

    <!-- Main Workspace Container -->
    <main class="flex-grow p-8 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
</script>

<style scoped>
.admin-sidebar-link {
  @apply px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors duration-300 font-medium;
}
.admin-sidebar-link.router-link-active {
  @apply text-white bg-slate-800;
}
</style>
