<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <span class="text-xs text-brand-secondary font-bold uppercase tracking-wider">Workspace Management</span>
        <h1 class="text-3xl font-extrabold text-white">System Analytics Dashboard</h1>
      </div>
      <span class="px-3 py-1 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full animate-pulse">
        System Health: Online
      </span>
    </div>

    <!-- Stats Grid -->
    <div v-if="loading" class="text-center py-12 text-slate-500">Compiling aggregates...</div>
    <div v-else-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-5 space-y-2">
        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Registered Users</span>
        <p class="text-3xl font-black text-white">{{ stats.totalUsers }}</p>
        <span class="text-[9px] text-slate-500">Lifetime accounts created</span>
      </div>
      <div class="glass-panel p-5 space-y-2">
        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Users</span>
        <p class="text-3xl font-black text-white">{{ stats.activeUsers }}</p>
        <span class="text-[9px] text-slate-500">Permitted profile credentials</span>
      </div>
      <div class="glass-panel p-5 space-y-2">
        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Blog Articles Views</span>
        <p class="text-3xl font-black text-white">{{ stats.totalViews }}</p>
        <span class="text-[9px] text-slate-500">Across {{ stats.totalArticles }} posts</span>
      </div>
      <div class="glass-panel p-5 space-y-2">
        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">API Database Engine</span>
        <p class="text-lg font-black text-brand-secondary uppercase mt-2">{{ stats.systemHealth?.dbClient }}</p>
        <span class="text-[9px] text-slate-500">Uptime: {{ Math.floor(stats.systemHealth?.uptimeSeconds / 60) }} mins</span>
      </div>
    </div>

    <!-- Lower Split Workspace: User Management and Tool Popularity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- User Profiles List -->
      <div class="lg:col-span-2 glass-panel p-6 space-y-4">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">User Directory & Overrides</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="border-b border-brand-border text-slate-500">
                <th class="pb-2">Name</th>
                <th class="pb-2">Email</th>
                <th class="pb-2">Role</th>
                <th class="pb-2">Status</th>
                <th class="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" class="border-b border-brand-border/40 hover:bg-slate-900/40">
                <td class="py-2.5 font-bold text-slate-200">{{ u.full_name || 'Lab Member' }}</td>
                <td class="py-2.5 text-slate-400">{{ u.email }}</td>
                <td class="py-2.5 capitalize text-brand-secondary font-semibold">{{ u.role }}</td>
                <td class="py-2.5">
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold" :class="u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'">
                    {{ u.is_active ? 'Active' : 'Banned' }}
                  </span>
                </td>
                <td class="py-2.5 text-right space-x-2">
                  <!-- Toggle ban -->
                  <button @click="toggleStatus(u)" class="text-[10px] font-bold hover:underline" :class="u.is_active ? 'text-red-400' : 'text-emerald-400'">
                    {{ u.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <!-- Toggle Role -->
                  <button @click="toggleRole(u)" class="text-[10px] text-brand-primary font-bold hover:underline">
                    {{ u.role === 'admin' ? 'Demote' : 'Promote' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Popular tools list -->
      <div class="glass-panel p-6 space-y-4">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Popular Dev Utilities</h3>
        <div class="space-y-3">
          <div v-for="t in stats?.popularTools" :key="t.tool_type" class="flex justify-between items-center text-xs">
            <span class="font-mono text-slate-300">{{ t.tool_type }}</span>
            <span class="px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-400 font-bold border border-brand-border">
              {{ t.count }} runs
            </span>
          </div>
          <div v-if="stats?.popularTools.length === 0" class="text-center py-12 text-slate-600 text-xs">
            No logged tool queries.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../services/api";

const stats = ref<any>(null);
const users = ref<any[]>([]);
const loading = ref(true);

async function loadData() {
  loading.value = true;
  try {
    const [statsRes, usersRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users")
    ]);
    stats.value = statsRes.data.data;
    users.value = usersRes.data.data;
  } catch (e) {
    console.error("Failed to load admin panel data:", e);
  } finally {
    loading.value = false;
  }
}

async function toggleStatus(user: any) {
  try {
    await api.patch(`/admin/users/${user.id}/status`, { is_active: !user.is_active });
    loadData();
  } catch (e) {
    alert("Could not change status.");
  }
}

async function toggleRole(user: any) {
  const newRole = user.role === "admin" ? "user" : "admin";
  try {
    await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
    loadData();
  } catch (e) {
    alert("Could not modify admin role.");
  }
}

onMounted(() => {
  loadData();
});
</script>
