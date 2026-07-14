<template>
  <div class="max-w-3xl mx-auto space-y-8 py-4 relative">
    <div v-if="roadmapStore.loading" class="text-center py-24 space-y-4">
      <div class="w-8 h-8 rounded-full border-2 border-brand-success border-t-transparent animate-spin mx-auto"></div>
      <p class="text-xs text-slate-400">Compiling roadmap details...</p>
    </div>

    <div v-else-if="roadmap" class="space-y-8">
      <!-- Title banner -->
      <div class="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-brand-success/5 blur-2xl rounded-full -z-10 w-[50%]"></div>
        
        <div class="space-y-1">
          <span class="text-xs text-brand-success font-bold uppercase tracking-widest">Roadmap Timeline</span>
          <h1 class="text-2xl font-extrabold text-white">{{ roadmap.desired_role }}</h1>
          <p class="text-xs text-slate-400">
            Skills path: {{ roadmap.current_skills }} | Level: {{ roadmap.experience_level }}
          </p>
        </div>

        <div class="flex gap-2">
          <button @click="copyShareLink" class="text-xs text-slate-300 bg-slate-900 border border-brand-border px-3.5 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
            {{ shareStatus }}
          </button>
          <button @click="bookmarkRoadmap" class="text-xs bg-brand-success text-white px-3.5 py-2 rounded-lg font-bold hover:bg-brand-success/90 transition-colors">
            {{ bookmarkStatus }}
          </button>
        </div>
      </div>

      <!-- Timeline path with dynamic SVG drawing -->
      <div class="relative pl-6 space-y-12">
        <!-- SVG Drawing path line -->
        <div class="absolute left-2.5 top-3 bottom-3 w-[2px] bg-slate-900/60 rounded-full overflow-hidden">
          <div ref="timelineActiveLineRef" class="w-full bg-gradient-to-b from-brand-success via-brand-primary to-brand-secondary h-0 transition-all duration-1000"></div>
        </div>

        <div 
          v-for="(step, index) in roadmap.roadmap_data" 
          :key="index"
          class="relative space-y-4 timeline-step-card opacity-0 translate-x-4"
        >
          <!-- Bullet Marker -->
          <div class="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-brand-dark border-4 border-brand-success flex items-center justify-center shadow-lg shadow-brand-success/20 hover:scale-125 transition-transform"></div>

          <div>
            <span class="text-xs text-brand-success font-bold uppercase tracking-wider">{{ step.month }}</span>
            <h3 class="text-lg font-bold text-white mt-0.5">{{ step.title }}</h3>
          </div>

          <div class="glass-panel p-5 space-y-4">
            <!-- Topics checklist -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Key Learning Modules</span>
              <ul class="space-y-2 text-xs">
                <li v-for="(topic, idx) in step.topics" :key="idx" class="flex items-start gap-2.5 text-slate-300">
                  <input type="checkbox" class="accent-brand-success mt-0.5 cursor-pointer hover:scale-105 transition-transform" />
                  <span>{{ topic }}</span>
                </li>
              </ul>
            </div>

            <!-- Milestone Project -->
            <div class="bg-slate-950/60 border border-brand-border p-3.5 rounded-xl space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-brand-success font-bold uppercase tracking-wider">Milestone Project</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-brand-success/15 text-brand-success">Action Required</span>
              </div>
              <h4 class="text-xs font-bold text-slate-100">{{ step.project?.name }}</h4>
              <p class="text-xs text-slate-400 leading-relaxed">{{ step.project?.desc }}</p>
            </div>

            <!-- Interview Preparation -->
            <div class="space-y-2 pt-2 border-t border-brand-border/40">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mock Interview Questions</span>
              <ul class="space-y-1 text-xs">
                <li v-for="(q, idx) in step.interviewPrep" :key="idx" class="text-slate-400 italic">
                  💡 "{{ q }}"
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="text-center py-24 glass-panel space-y-4">
      <p class="text-sm text-slate-400">Roadmap timeline not found or expired.</p>
      <router-link to="/roadmap" class="text-xs text-brand-primary font-bold">Go Back &rarr;</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoadmapStore } from "../../stores/roadmap";
import { useBlogStore } from "../../stores/blog";
import { useRoute } from "vue-router";
import { triggerConfetti } from "../../utils/animation";
import { gsap } from "gsap";

const roadmapStore = useRoadmapStore();
const blogStore = useBlogStore();
const route = useRoute();

const shareStatus = ref("Share Link");
const bookmarkStatus = ref("Bookmark Plan");

const roadmap = computed(() => roadmapStore.activeRoadmap);
const timelineActiveLineRef = ref<HTMLElement | null>(null);

async function copyShareLink(e: MouseEvent) {
  const url = window.location.href;
  await navigator.clipboard.writeText(url);
  shareStatus.value = "Copied!";
  triggerConfetti(e.clientX, e.clientY);
  setTimeout(() => {
    shareStatus.value = "Share Link";
  }, 2000);
}

async function bookmarkRoadmap(e: MouseEvent) {
  if (!roadmap.value) return;
  try {
    await blogStore.toggleBookmark("roadmap", roadmap.value.id);
    bookmarkStatus.value = "Saved!";
    triggerConfetti(e.clientX, e.clientY);
    setTimeout(() => {
      bookmarkStatus.value = "Bookmark Plan";
    }, 2000);
  } catch (e) {
    alert("Please sign in to save roadmaps to your profile.");
  }
}

onMounted(() => {
  const token = route.params.token as string;
  roadmapStore.fetchRoadmapByToken(token).then(async () => {
    await nextTick();
    // 1. Draw timeline path line down
    if (timelineActiveLineRef.value) {
      gsap.to(timelineActiveLineRef.value, {
        height: "100%",
        duration: 1.5,
        ease: "power2.inOut"
      });
    }

    // 2. Stagger timeline card entrances
    gsap.to(".timeline-step-card", {
      opacity: 1,
      x: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: "power3.out"
    });
  });
});
</script>
