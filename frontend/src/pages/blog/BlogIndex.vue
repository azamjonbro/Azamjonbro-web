<template>
  <div class="space-y-10 py-4">
    <!-- Header banner -->
    <div class="glass-panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full -z-10 w-[40%]"></div>
      <div class="space-y-2">
        <span class="text-xs text-cyan-400 font-bold uppercase tracking-widest">Platform Devlogs</span>
        <h1 class="text-3xl font-extrabold text-white">Community Blog & Updates</h1>
        <p class="text-sm text-slate-400 max-w-2xl">
          Follow software updates, community engineering logs, and platform release announcements.
        </p>
      </div>
      <input 
        v-model="search" 
        @input="onSearch"
        type="text" 
        placeholder="Search posts..." 
        class="bg-slate-950 border border-brand-border text-xs rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-400 w-full md:w-64 transition-all duration-300 focus:scale-[1.02]"
      />
    </div>

    <!-- Shimmer Skeleton Loading states -->
    <div v-if="blogStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="i in 3" 
        :key="i"
        class="glass-panel overflow-hidden flex flex-col justify-between border-slate-800/60 min-h-[320px]"
      >
        <div class="skeleton-shimmer w-full h-44 border-b border-brand-border/40"></div>
        <div class="p-5 space-y-3">
          <div class="skeleton-shimmer w-16 h-4 rounded"></div>
          <div class="skeleton-shimmer w-full h-6 rounded"></div>
          <div class="skeleton-shimmer w-5/6 h-4 rounded"></div>
        </div>
        <div class="p-5 pt-0 border-t border-brand-border/20 mt-auto flex justify-between">
          <div class="skeleton-shimmer w-12 h-3 rounded"></div>
          <div class="skeleton-shimmer w-16 h-3 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Articles Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="art in blogStore.articles" 
        :key="art.id" 
        class="glass-card overflow-hidden flex flex-col justify-between hover:border-cyan-400/40 hover:scale-[1.01] transition-all duration-350 group cursor-pointer"
        data-cursor-label="view"
      >
        <div class="relative overflow-hidden w-full h-44 border-b border-brand-border">
          <img 
            :src="art.featured_image || 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80'" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt="banner"
          />
        </div>
        
        <div class="p-5 space-y-3 flex-grow flex flex-col">
          <span class="inline-block text-[9px] px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 font-bold uppercase w-max tracking-wider">
            {{ art.category_slug || 'Tech' }}
          </span>
          <h3 class="text-base font-bold text-slate-100 leading-snug group-hover:text-cyan-400 transition-colors">
            {{ art.title_en }}
          </h3>
          <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-1">
            {{ art.content_en.replace(/### |^- |```[a-z]*|`|_/g, '').slice(0, 120) }}...
          </p>
        </div>

        <div class="p-5 pt-4 flex justify-between items-center border-t border-brand-border/40 mt-auto text-[10px] text-slate-500">
          <span>Views: {{ art.views_count }}</span>
          <router-link :to="{ name: 'blog-detail', params: { slug: art.slug } }" class="text-xs text-cyan-400 font-bold hover:text-white transition-colors">
            Read Post &rarr;
          </router-link>
        </div>
      </div>

      <div v-if="blogStore.articles.length === 0" class="col-span-3 text-center py-24 glass-panel space-y-2">
        <p class="text-sm text-slate-500">No blog posts found matching query.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useBlogStore } from "../../stores/blog";
import { gsap } from "gsap";

const blogStore = useBlogStore();
const search = ref("");

function onSearch() {
  blogStore.fetchArticles({ search: search.value });
}

onMounted(() => {
  blogStore.fetchArticles().then(() => {
    // Stagger article cards once loaded
    gsap.from(".glass-card", {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.6,
      ease: "power2.out"
    });
  });
});
</script>
