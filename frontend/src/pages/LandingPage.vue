<template>
  <div class="space-y-24 py-12">
    <!-- Hero Section -->
    <section class="text-center max-w-4xl mx-auto space-y-8 relative py-12 flex flex-col items-center">
      <!-- Glow background -->
      <div class="absolute inset-0 bg-brand-primary/10 blur-[150px] rounded-full -z-10 w-[60%] mx-auto h-[70%] animate-pulse"></div>

      <div class="space-y-4">
        <!-- Accent Pill -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-brand-border text-xs font-semibold text-brand-secondary shadow-lg hover:scale-105 transition-transform duration-300">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary"></span>
          </span>
          AzamjonBro Lab v1.0 Live
        </div>

        <!-- Headline using SplitType -->
        <h1 
          ref="titleRef" 
          :key="$i18n.locale" 
          class="hero-title text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-none overflow-hidden py-1"
        >
          {{ $t('hero.title') }}
        </h1>

        <p 
          ref="subtitleRef" 
          class="hero-subtitle text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed opacity-0 translate-y-4"
        >
          {{ $t('hero.subtitle') }}
        </p>
      </div>

      <!-- Action buttons with magnetic & ripple effects -->
      <div ref="btnGroupRef" class="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto opacity-0 translate-y-4">
        <router-link 
          to="/tools" 
          ref="primaryBtnRef"
          class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm glow-button shadow-lg shadow-brand-primary/20 hover:shadow-brand-secondary/35 transition-all text-center"
        >
          {{ $t('hero.ctaTools') }}
        </router-link>
        <router-link 
          to="/roadmap" 
          ref="secondaryBtnRef"
          class="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-brand-border bg-slate-900/60 hover:bg-slate-900/90 text-slate-100 text-sm font-semibold hover:border-slate-400 text-center"
        >
          {{ $t('hero.ctaRoadmap') }}
        </router-link>
      </div>
    </section>

    <!-- Interactive Modules Grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 1. Dev Tools Card -->
      <div ref="card1" class="glass-card p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden" data-cursor-label="view">
        <div class="card-glow absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Developer Tools</h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-6">
            A toolbox of 23 offline-first dev utilities, including JWT decoders, UUID/password creators, SQL beautifiers, and encoders.
          </p>
        </div>
        <router-link to="/tools" class="text-xs text-brand-primary group-hover:text-white transition-colors font-bold inline-flex items-center gap-1 mt-auto">
          Explore Tools &rarr;
        </router-link>
      </div>

      <!-- 2. Learning Center Card -->
      <div ref="card2" class="glass-card p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden" data-cursor-label="read">
        <div class="card-glow absolute inset-0 bg-gradient-to-r from-brand-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-brand-secondary/10 flex items-center justify-center text-brand-secondary border border-brand-secondary/20 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Learning Platform</h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-6">
            Detailed articles on Docker, PostgreSQL, Vue, Express, and System Design with best practices and interactive code templates.
          </p>
        </div>
        <router-link to="/learning" class="text-xs text-brand-secondary group-hover:text-white transition-colors font-bold inline-flex items-center gap-1 mt-auto">
          Access Platform &rarr;
        </router-link>
      </div>

      <!-- 3. AI Roadmap Generator -->
      <div ref="card3" class="glass-card p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden" data-cursor-label="map">
        <div class="card-glow absolute inset-0 bg-gradient-to-r from-brand-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-brand-success/10 flex items-center justify-center text-brand-success border border-brand-success/20 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">AI Roadmap Generator</h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-6">
            Enter your tech goals and experience level to generate custom step-by-step career timelines and study guidelines.
          </p>
        </div>
        <router-link to="/roadmap" class="text-xs text-brand-success group-hover:text-white transition-colors font-bold inline-flex items-center gap-1 mt-auto">
          Create Roadmap &rarr;
        </router-link>
      </div>

      <!-- 4. Startup Validations -->
      <div ref="card4" class="glass-card p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden" data-cursor-label="pitch">
        <div class="card-glow absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Startup Validation</h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-6">
            Pitch startup concepts and generate structured SWOT grids, initial user models, market metrics (TAM, SAM), and MVP suggestions.
          </p>
        </div>
        <router-link to="/startup" class="text-xs text-yellow-500 group-hover:text-white transition-colors font-bold inline-flex items-center gap-1 mt-auto">
          Validate Concept &rarr;
        </router-link>
      </div>

      <!-- 5. Cybersecurity Playground -->
      <div ref="card5" class="glass-card p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden" data-cursor-label="play">
        <div class="card-glow absolute inset-0 bg-gradient-to-r from-brand-error/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-brand-error/10 flex items-center justify-center text-brand-error border border-brand-error/20 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Cybersecurity Lab</h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-6">
            Interactive, sandboxed mock simulations for SQL Injecting queries, parsing JWT headers, and executing shell codes safely.
          </p>
        </div>
        <router-link to="/playground" class="text-xs text-brand-error group-hover:text-white transition-colors font-bold inline-flex items-center gap-1 mt-auto">
          Open Playground &rarr;
        </router-link>
      </div>

      <!-- 6. Blog & Community -->
      <div ref="card6" class="glass-card p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden" data-cursor-label="read">
        <div class="card-glow absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.084.29.125.597.125.904v8.587c0 1.626-1.332 2.946-2.975 2.946H6.6c-1.643 0-2.975-1.32-2.975-2.946V9.415c0-.307.041-.614.125-.904M20.25 8.511a8.675 8.675 0 0 0-2.975-1.745m0 0A8.674 8.674 0 0 0 12 6.042A8.674 8.674 0 0 0 6.6 6.766m10.675-.001C16.634 5.317 15.65 4.5 14.5 4.5H9.5c-1.15 0-2.134.817-2.775 2.265m0 0a8.674 8.674 0 0 0-2.975 1.745M12 12v3.75m-3-1.5h6" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Community Blog</h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-6">
            Read engineering experiences, devlogs, and tips from our community with direct markdown comments support.
          </p>
        </div>
        <router-link to="/blog" class="text-xs text-cyan-500 group-hover:text-white transition-colors font-bold inline-flex items-center gap-1 mt-auto">
          Read Articles &rarr;
        </router-link>
      </div>
    </section>

    <!-- Platform Operational Statistics Section -->
    <section ref="statsSectionRef" class="glass-panel p-8 sm:p-12 relative overflow-hidden border-slate-800">
      <!-- Glow decoration -->
      <div class="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-brand-secondary/5 blur-[100px] pointer-events-none"></div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <!-- Text details -->
        <div class="space-y-4">
          <span class="text-xs font-bold text-brand-primary uppercase tracking-widest block">System Telemetry</span>
          <h2 class="text-3xl font-extrabold text-white leading-tight">Secure Sandbox Operations Hub</h2>
          <p class="text-sm text-slate-400 leading-relaxed">
            Every transaction, SQL execution, and JWT signature is performed locally inside sandboxed runtimes, synchronized through Node servers.
          </p>
          <div class="pt-4 flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-3 h-3 rounded-full bg-brand-success animate-pulse"></span>
            <span class="text-xs text-brand-success font-semibold">ALL COMPLIANCE NODES OPERATIONAL</span>
          </div>
        </div>

        <!-- Telemetry Count Ups -->
        <div class="grid grid-cols-2 gap-6 lg:col-span-2">
          <!-- Stat Box 1 -->
          <div class="bg-slate-950/40 border border-white/[0.03] rounded-xl p-5 space-y-2 relative overflow-hidden">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Sandbox Utilities</span>
            <div class="text-3xl font-black text-white flex items-baseline">
              <span class="stat-num" data-val="23">0</span>
              <span class="text-brand-primary ml-0.5">+</span>
            </div>
            <!-- Progress Line -->
            <div class="h-[2px] bg-slate-900 rounded-full overflow-hidden w-full relative">
              <div class="stat-progress-bar absolute left-0 top-0 h-full bg-brand-primary" style="width: 0%"></div>
            </div>
          </div>

          <!-- Stat Box 2 -->
          <div class="bg-slate-950/40 border border-white/[0.03] rounded-xl p-5 space-y-2 relative overflow-hidden">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Local Compile Rates</span>
            <div class="text-3xl font-black text-white flex items-baseline">
              <span class="stat-num" data-val="99">0</span>
              <span class="text-brand-secondary ml-0.5">%</span>
            </div>
            <!-- Progress Line -->
            <div class="h-[2px] bg-slate-900 rounded-full overflow-hidden w-full relative">
              <div class="stat-progress-bar absolute left-0 top-0 h-full bg-brand-secondary" style="width: 0%"></div>
            </div>
          </div>

          <!-- Stat Box 3 -->
          <div class="bg-slate-950/40 border border-white/[0.03] rounded-xl p-5 space-y-2 relative overflow-hidden">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Secure Executions</span>
            <div class="text-3xl font-black text-white flex items-baseline">
              <span class="stat-num" data-val="15000">0</span>
              <span class="text-brand-success ml-0.5">+</span>
            </div>
            <!-- Progress Line -->
            <div class="h-[2px] bg-slate-900 rounded-full overflow-hidden w-full relative">
              <div class="stat-progress-bar absolute left-0 top-0 h-full bg-brand-success" style="width: 0%"></div>
            </div>
          </div>

          <!-- Stat Box 4 -->
          <div class="bg-slate-950/40 border border-white/[0.03] rounded-xl p-5 space-y-2 relative overflow-hidden">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Uptime Metric</span>
            <div class="text-3xl font-black text-white flex items-baseline">
              <span class="stat-num" data-val="99">0</span>
              <span class="text-yellow-500 ml-0.5">.99%</span>
            </div>
            <!-- Progress Line -->
            <div class="h-[2px] bg-slate-900 rounded-full overflow-hidden w-full relative">
              <div class="stat-progress-bar absolute left-0 top-0 h-full bg-yellow-500" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Animated SVG chart -->
      <div class="mt-12 bg-slate-950/80 border border-white/[0.03] rounded-xl p-5 space-y-4">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">API Compile Frequency History</span>
        <div class="h-32 w-full relative overflow-hidden">
          <svg class="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
            <!-- Grid Lines -->
            <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
            <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
            
            <!-- Glow shadow gradient -->
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M0,120 L0,90 Q80,40 160,70 T320,30 T480,80 T600,20 L600,120 Z" 
              fill="url(#chart-grad)"
            />
            
            <!-- Animated Plot Path -->
            <path 
              ref="chartPathRef"
              d="M0,90 Q80,40 160,70 T320,30 T480,80 T600,20" 
              fill="none" 
              stroke="url(#chart-line-grad)" 
              stroke-width="2.5" 
              class="chart-line-path"
              stroke-dasharray="1000"
              stroke-dashoffset="1000"
            />
            
            <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="50%" stop-color="#a855f7" />
              <stop offset="100%" stop-color="#10b981" />
            </linearGradient>
          </svg>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { initMagnetic, initCardTilt, initRipple } from "../utils/animation";
import { gsap } from "gsap";
import SplitType from "split-type";

// Element references
const titleRef = ref<HTMLElement | null>(null);
const subtitleRef = ref<HTMLElement | null>(null);
const btnGroupRef = ref<HTMLElement | null>(null);
const chartPathRef = ref<SVGPathElement | null>(null);
const statsSectionRef = ref<HTMLElement | null>(null);

const primaryBtnRef = ref<any>(null);
const secondaryBtnRef = ref<any>(null);

// Card refs
const card1 = ref<HTMLElement | null>(null);
const card2 = ref<HTMLElement | null>(null);
const card3 = ref<HTMLElement | null>(null);
const card4 = ref<HTMLElement | null>(null);
const card5 = ref<HTMLElement | null>(null);
const card6 = ref<HTMLElement | null>(null);

let destroyFns: Array<() => void> = [];
let observer: IntersectionObserver | null = null;

function animateHeroText() {
  if (titleRef.value) {
    const split = new SplitType(titleRef.value, { types: "words,chars" });
    gsap.from(split.chars, {
      opacity: 0,
      y: 20,
      stagger: 0.035,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto"
    });
  }

  if (subtitleRef.value) {
    gsap.to(subtitleRef.value, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.35,
      ease: "power2.out",
      overwrite: "auto"
    });
  }

  if (btnGroupRef.value) {
    gsap.to(btnGroupRef.value, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.5,
      ease: "power2.out",
      overwrite: "auto"
    });
  }
}

onMounted(() => {
  // Animate hero text
  animateHeroText();

  // Bind route transition completes
  window.addEventListener("page-transition-complete", animateHeroText);

  // Bind Magnetic & Ripple to CTA buttons
  if (primaryBtnRef.value?.$el) {
    destroyFns.push(initMagnetic(primaryBtnRef.value.$el, 0.25));
    destroyFns.push(initRipple(primaryBtnRef.value.$el));
  }
  if (secondaryBtnRef.value?.$el) {
    destroyFns.push(initMagnetic(secondaryBtnRef.value.$el, 0.25));
    destroyFns.push(initRipple(secondaryBtnRef.value.$el));
  }

  // Bind Card tilts
  const cards = [card1.value, card2.value, card3.value, card4.value, card5.value, card6.value];
  cards.forEach((card) => {
    if (card) {
      destroyFns.push(initCardTilt(card, 7));
      destroyFns.push(initRipple(card));
    }
  });

  // Stagger entry animation for modules grid cards
  gsap.from(cards.filter(Boolean), {
    opacity: 0,
    y: 40,
    stagger: 0.08,
    duration: 0.8,
    ease: "power3.out",
    delay: 0.4
  });

  // Scroll Trigger observer for Statistics section
  if (statsSectionRef.value) {
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Animate count-up metrics numbers
        statsSectionRef.value?.querySelectorAll(".stat-num").forEach((numEl) => {
          const targetVal = parseInt(numEl.getAttribute("data-val") || "0", 10);
          const obj = { val: 0 };
          gsap.to(obj, {
            val: targetVal,
            duration: 1.8,
            ease: "power3.out",
            onUpdate: () => {
              numEl.textContent = Math.floor(obj.val).toLocaleString();
            }
          });
        });

        // Animate progress lines
        statsSectionRef.value?.querySelectorAll(".stat-progress-bar").forEach((bar) => {
          gsap.to(bar, {
            width: "100%",
            duration: 1.5,
            ease: "power2.out"
          });
        });

        // Animate SVG Line path
        if (chartPathRef.value) {
          gsap.to(chartPathRef.value, {
            strokeDashoffset: 0,
            duration: 2.2,
            ease: "power2.out"
          });
        }

        // Play once
        if (observer && statsSectionRef.value) {
          observer.unobserve(statsSectionRef.value);
        }
      }
    }, { threshold: 0.15 });

    observer.observe(statsSectionRef.value);
  }
});

onUnmounted(() => {
  destroyFns.forEach((fn) => fn());
  window.removeEventListener("page-transition-complete", animateHeroText);
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
/* Grid movement pattern styling */
.glass-panel {
  @apply relative overflow-hidden;
}

/* Float Animation keyframes for subtle card movements */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.glass-card {
  transform-style: preserve-3d;
  animation: float 6s ease-in-out infinite;
}
.glass-card:nth-child(even) {
  animation-delay: 2s;
}
.glass-card:nth-child(3n) {
  animation-delay: 4s;
}

.glass-card > * {
  transform: translateZ(20px);
}
</style>
