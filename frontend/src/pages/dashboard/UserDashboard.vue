<template>
  <div class="space-y-8 py-4">
    <!-- Header banner -->
    <div class="glass-panel p-6 sm:p-8 flex items-center justify-between gap-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full -z-10 w-[40%]"></div>
      <div class="flex items-center gap-4">
        <img :src="authStore.user?.avatar_url" class="w-16 h-16 rounded-full border-2 border-brand-primary" alt="avatar" />
        <div class="space-y-1">
          <span class="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{{ authStore.user?.role }} Account</span>
          <h1 class="text-2xl font-extrabold text-white">{{ authStore.user?.full_name || 'Lab Member' }}</h1>
          <p class="text-xs text-slate-400">{{ authStore.user?.email }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs selector -->
    <div class="flex border-b border-brand-border gap-6 text-sm font-semibold pb-1">
      <button 
        v-for="t in TABS" 
        :key="t.id"
        @click="activeTab = t.id"
        class="pb-2 text-xs uppercase tracking-wider transition-all relative"
        :class="activeTab === t.id ? 'text-white font-bold' : 'text-slate-400 hover:text-white'"
      >
        {{ t.name }}
        <span v-if="activeTab === t.id" class="absolute bottom-0 left-0 w-full h-[1.5px] bg-brand-primary rounded-full"></span>
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="min-h-[300px]">
      <!-- 1. Saved timelines (Roadmaps) -->
      <div v-if="activeTab === 'roadmaps'" class="space-y-4">
        <div v-if="roadmapStore.loading" class="text-xs text-slate-500">Loading timelines...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="r in roadmapStore.savedRoadmaps" :key="r.id" class="glass-panel p-5 flex flex-col justify-between hover:border-brand-success/40 transition-colors">
            <div class="space-y-2">
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-brand-success/15 text-brand-success font-bold uppercase">AI Timeline</span>
              <h4 class="text-sm font-bold text-white leading-tight">{{ r.desired_role }}</h4>
              <p class="text-[11px] text-slate-400">Commitment: {{ r.time_available }}</p>
            </div>
            <div class="flex justify-between items-center mt-5 text-[10px] text-slate-500">
              <span>{{ new Date(r.created_at).toLocaleDateString() }}</span>
              <router-link :to="{ name: 'roadmap-detail', params: { token: r.share_token } }" class="text-brand-success font-bold">
                View Path &rarr;
              </router-link>
            </div>
          </div>
          <div v-if="roadmapStore.savedRoadmaps.length === 0" class="col-span-2 text-center py-12 glass-panel text-xs text-slate-500">
            No saved roadmaps. Run the generator to begin tracking!
          </div>
        </div>
      </div>

      <!-- 2. Saved validations -->
      <div v-if="activeTab === 'validations'" class="space-y-4">
        <div v-if="validationStore.loading" class="text-xs text-slate-500">Loading reports...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="v in validationStore.savedValidations" :key="v.id" class="glass-panel p-5 flex flex-col justify-between hover:border-yellow-500/40 transition-colors">
            <div class="space-y-2">
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-500 font-bold uppercase">Startup Report</span>
              <h4 class="text-sm font-bold text-slate-100 leading-snug line-clamp-2">"{{ v.idea_description }}"</h4>
            </div>
            <div class="flex justify-between items-center mt-5 text-[10px] text-slate-500">
              <span>{{ new Date(v.created_at).toLocaleDateString() }}</span>
              <router-link :to="{ name: 'startup-detail', params: { token: v.share_token } }" class="text-yellow-500 font-bold">
                Review SWOT &rarr;
              </router-link>
            </div>
          </div>
          <div v-if="validationStore.savedValidations.length === 0" class="col-span-2 text-center py-12 glass-panel text-xs text-slate-500">
            No startup ideas validated yet. Pitch a concept to construct logs.
          </div>
        </div>
      </div>

      <!-- 3. Bookmarks -->
      <div v-if="activeTab === 'bookmarks'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="bk in blogStore.bookmarks" :key="bk.id" class="glass-panel p-5 flex flex-col justify-between hover:border-brand-primary/40 transition-colors">
            <div class="space-y-2">
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-bold uppercase">{{ bk.bookmarkable_type }}</span>
              <h4 v-if="bk.bookmarkable_type === 'article'" class="text-sm font-bold text-white leading-tight">
                {{ bk.details?.title_en }}
              </h4>
              <h4 v-else-if="bk.bookmarkable_type === 'roadmap'" class="text-sm font-bold text-white leading-tight">
                Roadmap: {{ bk.details?.desired_role }}
              </h4>
              <h4 v-else-if="bk.bookmarkable_type === 'validation'" class="text-sm font-bold text-white leading-tight line-clamp-1">
                Startup: "{{ bk.details?.idea_description }}"
              </h4>
            </div>
            <div class="flex justify-between items-center mt-5 text-[10px]">
              <button @click="removeBookmark(bk.bookmarkable_type, bk.bookmarkable_id)" class="text-brand-error font-semibold hover:underline">
                Remove
              </button>
              <router-link 
                v-if="bk.bookmarkable_type === 'article'"
                :to="{ name: 'learning-detail', params: { slug: bk.details?.slug } }" 
                class="text-brand-primary font-bold"
              >
                Read Tutorial &rarr;
              </router-link>
              <router-link 
                v-else-if="bk.bookmarkable_type === 'roadmap'"
                :to="{ name: 'roadmap-detail', params: { token: bk.details?.share_token } }" 
                class="text-brand-success font-bold"
              >
                Open Path &rarr;
              </router-link>
            </div>
          </div>
          <div v-if="blogStore.bookmarks.length === 0" class="col-span-2 text-center py-12 glass-panel text-xs text-slate-500">
            No bookmarks saved. Check tutorials and roadmaps to pin contents.
          </div>
        </div>
      </div>

      <!-- 4. Settings -->
      <div v-if="activeTab === 'settings'" class="max-w-md glass-panel p-6 space-y-6">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Account Preferences</h3>
        
        <form @submit.prevent="updateSettings" class="space-y-4">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Full Name</label>
            <input v-model="settings.full_name" type="text" class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-primary" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Preferred Language</label>
            <select v-model="settings.preferred_language" class="w-full bg-slate-900 border border-brand-border text-xs rounded-lg px-3 py-2 text-slate-200 outline-none">
              <option value="en">English</option>
              <option value="uz">O'zbek</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <button type="submit" class="px-5 py-2 bg-brand-primary text-xs font-bold text-white rounded-lg hover:bg-brand-primary/95 transition-all">
            {{ settingsStatus }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRoadmapStore } from "../../stores/roadmap";
import { useValidationStore } from "../../stores/validation";
import { useBlogStore } from "../../stores/blog";
import api from "../../services/api";

const authStore = useAuthStore();
const roadmapStore = useRoadmapStore();
const validationStore = useValidationStore();
const blogStore = useBlogStore();

const TABS = [
  { id: "roadmaps", name: "Saved Timelines" },
  { id: "validations", name: "Startup Reports" },
  { id: "bookmarks", name: "Bookmarks" },
  { id: "settings", name: "Preferences" }
];

const activeTab = ref("roadmaps");
const settingsStatus = ref("Save Changes");

const settings = ref({
  full_name: authStore.user?.full_name || "",
  preferred_language: authStore.user?.preferred_language || "en"
});

async function updateSettings() {
  settingsStatus.value = "Saving...";
  try {
    await api.patch("/auth/me", settings.value);
    await authStore.fetchMe();
    settingsStatus.value = "Saved!";
    setTimeout(() => {
      settingsStatus.value = "Save Changes";
    }, 2000);
  } catch (e) {
    settingsStatus.value = "Error Saving";
  }
}

async function removeBookmark(type: string, id: string) {
  try {
    await blogStore.toggleBookmark(type as any, id);
  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  roadmapStore.fetchSavedRoadmaps();
  validationStore.fetchSavedValidations();
  blogStore.fetchBookmarks();
});
</script>
