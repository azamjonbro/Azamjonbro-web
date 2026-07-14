<template>
  <div class="space-y-10 py-4">
    <!-- Header banner -->
    <div class="glass-panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-brand-primary/5 blur-3xl rounded-full -z-10 w-[45%]"></div>
      <div class="space-y-2">
        <span class="text-xs text-brand-primary font-bold uppercase tracking-widest">Developer Knowledge Base</span>
        <h1 class="text-3xl font-extrabold text-white">Learning & System Design Platform</h1>
        <p class="text-sm text-slate-400 max-w-2xl">
          Deep-dive tutorials, system architectures, production advice, and copyable code modules written for modern software builders.
        </p>
      </div>
    </div>

    <!-- Main Body: Split layouts of categories and articles -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Subjects / Categories Selector Left -->
      <aside class="space-y-4">
        <div class="glass-panel p-4 space-y-3">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Filter by Subject</span>
          <div class="flex flex-wrap lg:flex-col gap-1.5">
            <button 
              @click="selectCategory('')" 
              class="px-3.5 py-2 text-xs font-semibold rounded-lg text-left transition-all"
              :class="!activeCategory ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'"
            >
              📚 All Subjects
            </button>
            <button 
              v-for="cat in blogStore.categories" 
              :key="cat.id" 
              @click="selectCategory(cat.slug)"
              class="px-3.5 py-2 text-xs font-semibold rounded-lg text-left transition-all capitalize"
              :class="activeCategory === cat.slug ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'"
            >
              {{ cat.slug === 'system-design' ? '📐' : cat.slug === 'cybersecurity' ? '🛡️' : cat.slug === 'devops' ? '☁️' : '⚙️' }} 
              {{ cat.name_en }}
            </button>
          </div>
        </div>

        <!-- Learning progress widget -->
        <div class="glass-panel p-4 space-y-3">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Your Reading Progress</span>
          <div class="flex items-center gap-3">
            <div class="relative w-12 h-12 flex items-center justify-center">
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" stroke-width="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="#6366f1" stroke-width="4" fill="transparent" stroke-dasharray="125" stroke-dashoffset="62" />
              </svg>
              <span class="text-[10px] font-bold text-slate-200">50%</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-300">1 of 2 completed</p>
              <span class="text-[9px] text-slate-500">Keep learning to grow skills!</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Tutorials Feed Right -->
      <div class="lg:col-span-3 space-y-6">
        <div v-if="blogStore.loading" class="text-center py-24">
          <div class="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p class="text-xs text-slate-500">Loading tutorials...</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="art in blogStore.articles" 
            :key="art.id" 
            class="glass-panel overflow-hidden flex flex-col justify-between hover:border-brand-primary/40 transition-colors group"
          >
            <div>
              <img 
                :src="art.featured_image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'" 
                class="w-full h-40 object-cover border-b border-brand-border"
                alt="banner"
              />
              <div class="p-5 space-y-3">
                <div class="flex items-center justify-between text-[10px] text-slate-500">
                  <span class="capitalize text-brand-primary font-bold">{{ art.category_slug }}</span>
                  <span>{{ art.read_time_minutes }} min read</span>
                </div>
                <h3 class="text-base font-bold text-white leading-snug group-hover:text-brand-primary transition-colors">
                  {{ art.title_en }}
                </h3>
              </div>
            </div>
            
            <div class="p-5 pt-0 flex justify-between items-center border-t border-brand-border/40 pt-4 mt-auto">
              <span class="text-[10px] text-slate-500">Views: {{ art.views_count }}</span>
              <router-link :to="{ name: 'learning-detail', params: { slug: art.slug } }" class="text-xs text-brand-primary font-bold group-hover:translate-x-1 transition-transform">
                Read Tutorial &rarr;
              </router-link>
            </div>
          </div>

          <div v-if="blogStore.articles.length === 0" class="col-span-2 text-center py-24 glass-panel space-y-2">
            <p class="text-sm text-slate-500">No tutorials found matching selection.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useBlogStore } from "../../stores/blog";

const blogStore = useBlogStore();
const activeCategory = ref("");

function selectCategory(slug: string) {
  activeCategory.value = slug;
  blogStore.fetchArticles({ category: slug });
}

onMounted(() => {
  blogStore.fetchCategories();
  blogStore.fetchArticles();
});
</script>
