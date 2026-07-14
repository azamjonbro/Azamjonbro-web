<template>
  <div class="max-w-4xl mx-auto space-y-8 py-4">
    <div v-if="validationStore.loading" class="text-center py-24 space-y-4">
      <div class="w-8 h-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin mx-auto"></div>
      <p class="text-xs text-slate-400">Compiling venture capital audit reports...</p>
    </div>

    <div v-else-if="report" class="space-y-8">
      <!-- Title header -->
      <div class="glass-panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-yellow-500/5 blur-2xl rounded-full -z-10 w-[40%]"></div>
        <div class="space-y-2">
          <span class="text-xs text-yellow-500 font-bold uppercase tracking-widest">Venture Validation Report</span>
          <h1 class="text-lg font-bold text-white leading-relaxed truncate max-w-xl">
            "{{ report.idea_description }}"
          </h1>
          <p class="text-xs text-slate-400">Industry Classification: {{ report.validation_report?.industry }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="copyShareLink" class="text-xs text-slate-300 bg-slate-900 border border-brand-border px-3.5 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
            {{ shareStatus }}
          </button>
          <button @click="bookmarkValidation" class="text-xs bg-yellow-500 text-slate-950 px-3.5 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors">
            {{ bookmarkStatus }}
          </button>
        </div>
      </div>

      <!-- Opportunity Feasibility / Risk SVG Progress Rings (NEW) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Ring 1: Feasibility -->
        <div class="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Feasibility Score</span>
          <div class="relative w-24 h-24">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" stroke-width="8" fill="transparent" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#10b981" stroke-width="8" fill="transparent" 
                stroke-dasharray="251.2" 
                stroke-dashoffset="251.2"
                class="progress-ring-circle transition-all duration-1000"
                style="stroke-dashoffset: 37.68px" 
              /> <!-- 85% -->
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono text-lg font-black text-white">85%</div>
          </div>
        </div>

        <!-- Ring 2: Opportunity -->
        <div class="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Opportunity</span>
          <div class="relative w-24 h-24">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" stroke-width="8" fill="transparent" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#a855f7" stroke-width="8" fill="transparent" 
                stroke-dasharray="251.2" 
                stroke-dashoffset="251.2"
                class="progress-ring-circle transition-all duration-1000"
                style="stroke-dashoffset: 75.36px" 
              /> <!-- 70% -->
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono text-lg font-black text-white">70%</div>
          </div>
        </div>

        <!-- Ring 3: Risk Factor -->
        <div class="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Assessment</span>
          <div class="relative w-24 h-24">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" stroke-width="8" fill="transparent" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#ef4444" stroke-width="8" fill="transparent" 
                stroke-dasharray="251.2" 
                stroke-dashoffset="251.2"
                class="progress-ring-circle transition-all duration-1000"
                style="stroke-dashoffset: 163.28px" 
              /> <!-- 35% -->
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono text-lg font-black text-white">35%</div>
          </div>
        </div>
      </div>

      <!-- SWOT Matrix Quadrants with Left/Right entrances -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">SWOT Business Analysis Matrix</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Strengths -->
          <div class="glass-panel p-5 border-emerald-500/20 bg-emerald-950/5 swot-left opacity-0 -translate-x-6">
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">S · Strengths</span>
            <ul class="list-disc pl-4 text-xs text-slate-300 space-y-2 mt-3">
              <li v-for="(str, idx) in report.validation_report?.swot?.strengths" :key="idx">{{ str }}</li>
            </ul>
          </div>
          <!-- Weaknesses -->
          <div class="glass-panel p-5 border-brand-error/20 bg-brand-error/5 swot-right opacity-0 translate-x-6">
            <span class="text-xs font-bold text-brand-error uppercase tracking-widest">W · Weaknesses</span>
            <ul class="list-disc pl-4 text-xs text-slate-300 space-y-2 mt-3">
              <li v-for="(wk, idx) in report.validation_report?.swot?.weaknesses" :key="idx">{{ wk }}</li>
            </ul>
          </div>
          <!-- Opportunities -->
          <div class="glass-panel p-5 border-cyan-500/20 bg-cyan-950/5 swot-left opacity-0 -translate-x-6">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest">O · Opportunities</span>
            <ul class="list-disc pl-4 text-xs text-slate-300 space-y-2 mt-3">
              <li v-for="(op, idx) in report.validation_report?.swot?.opportunities" :key="idx">{{ op }}</li>
            </ul>
          </div>
          <!-- Threats -->
          <div class="glass-panel p-5 border-yellow-500/20 bg-yellow-950/5 swot-right opacity-0 translate-x-6">
            <span class="text-xs font-bold text-yellow-400 uppercase tracking-widest">T · Threats</span>
            <ul class="list-disc pl-4 text-xs text-slate-300 space-y-2 mt-3">
              <li v-for="(th, idx) in report.validation_report?.swot?.threats" :key="idx">{{ th }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Market Estimates -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="glass-panel p-5 text-center space-y-2 hover:scale-[1.01] transition-transform">
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Addressable Market (TAM)</span>
          <p class="text-sm font-semibold text-slate-200">{{ report.validation_report?.marketSize?.TAM }}</p>
        </div>
        <div class="glass-panel p-5 text-center space-y-2 hover:scale-[1.01] transition-transform">
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Serviceable Addressable Market (SAM)</span>
          <p class="text-sm font-semibold text-slate-200">{{ report.validation_report?.marketSize?.SAM }}</p>
        </div>
        <div class="glass-panel p-5 text-center space-y-2 hover:scale-[1.01] transition-transform">
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Serviceable Obtainable Market (SOM)</span>
          <p class="text-sm font-semibold text-slate-200">{{ report.validation_report?.marketSize?.SOM }}</p>
        </div>
      </div>

      <!-- Competitors and MVP Scope -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Competitor Breakdown -->
        <div class="glass-panel p-5 space-y-4">
          <span class="text-xs font-bold text-white uppercase tracking-wider block">Competitive Advantage Comparison</span>
          <div class="space-y-3">
            <div v-for="(comp, idx) in report.validation_report?.competitors" :key="idx" class="border-b border-brand-border/40 pb-3 last:border-b-0 last:pb-0 text-xs">
              <h4 class="font-bold text-slate-100 mb-1">{{ comp.name }}</h4>
              <p class="text-[11px] text-brand-success mb-1">PROS: {{ comp.pros }}</p>
              <p class="text-[11px] text-brand-error">CONS: {{ comp.cons }}</p>
            </div>
          </div>
        </div>

        <!-- MVP Scope with typewriter recommendations -->
        <div class="glass-panel p-5 space-y-4">
          <span class="text-xs font-bold text-white uppercase tracking-wider block">MVP Scope Recommendations</span>
          <ul class="space-y-3 text-xs">
            <li v-for="(item, idx) in report.validation_report?.mvpScope" :key="idx" class="flex items-center gap-2.5 text-slate-300">
              <span class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
          
          <div class="bg-slate-950 p-3 rounded-lg border border-brand-border mt-4">
            <span class="text-[9px] text-slate-500 uppercase block mb-1">Recommended Tech Stack</span>
            <code ref="techRef" class="text-xs font-mono text-yellow-500 typewriter-cursor"></code>
          </div>
        </div>
      </div>

      <!-- Monetization and Development Roadmap -->
      <div class="glass-panel p-6 space-y-6">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Monetization & Implementation Timelines</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <!-- Monetization -->
          <div class="space-y-3">
            <span class="font-bold text-slate-300 block">Monetization Strategy</span>
            <ul class="list-disc pl-4 text-slate-400 space-y-2">
              <li v-for="(plan, idx) in report.validation_report?.monetization" :key="idx">{{ plan }}</li>
            </ul>
          </div>
          <!-- Dev roadmap -->
          <div class="space-y-3">
            <span class="font-bold text-slate-300 block">Development Roadmap</span>
            <div class="space-y-3">
              <div v-for="(item, idx) in report.validation_report?.developmentRoadmap" :key="idx" class="border-l-2 border-yellow-500/40 pl-3">
                <span class="text-[10px] text-yellow-500 font-bold block">{{ item.phase }}</span>
                <p class="text-slate-400 leading-relaxed mt-0.5">{{ item.focus }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty error state -->
    <div v-else class="text-center py-24 glass-panel space-y-4">
      <p class="text-sm text-slate-400">Startup validation report not found.</p>
      <router-link to="/startup" class="text-xs text-brand-primary font-bold">Go Back &rarr;</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useValidationStore } from "../../stores/validation";
import { useBlogStore } from "../../stores/blog";
import { useRoute } from "vue-router";
import { triggerConfetti, initTypewriter } from "../../utils/animation";
import { gsap } from "gsap";

const validationStore = useValidationStore();
const blogStore = useBlogStore();
const route = useRoute();

const shareStatus = ref("Share Report");
const bookmarkStatus = ref("Save to Profile");
const techRef = ref<HTMLElement | null>(null);

const report = computed(() => validationStore.activeValidation);

async function copyShareLink(e: MouseEvent) {
  const url = window.location.href;
  await navigator.clipboard.writeText(url);
  shareStatus.value = "Copied!";
  triggerConfetti(e.clientX, e.clientY);
  setTimeout(() => {
    shareStatus.value = "Share Report";
  }, 2000);
}

async function bookmarkValidation(e: MouseEvent) {
  if (!report.value) return;
  try {
    await blogStore.toggleBookmark("validation", report.value.id);
    bookmarkStatus.value = "Saved!";
    triggerConfetti(e.clientX, e.clientY);
    setTimeout(() => {
      bookmarkStatus.value = "Save to Profile";
    }, 2000);
  } catch (e) {
    alert("Please sign in to save validation reports.");
  }
}

onMounted(() => {
  const token = route.params.token as string;
  validationStore.fetchValidationByToken(token).then(async () => {
    await nextTick();

    // 1. Animate SVG progress rings dash offsets
    gsap.from(".progress-ring-circle", {
      strokeDashoffset: 251.2,
      duration: 1.5,
      ease: "power2.out",
      stagger: 0.1
    });

    // 2. Animate SWOT Matrix quadrant columns staggers
    gsap.to(".swot-left", {
      opacity: 1,
      x: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out"
    });
    gsap.to(".swot-right", {
      opacity: 1,
      x: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out"
    });

    // 3. Trigger Typewriter on recommended tech stack code content
    if (techRef.value && report.value?.validation_report?.techRecommendation) {
      initTypewriter(techRef.value, report.value.validation_report.techRecommendation, 40);
    }
  });
});
</script>

<style scoped>
.progress-ring-circle {
  transition: stroke-dashoffset 1s ease-in-out;
}
</style>
