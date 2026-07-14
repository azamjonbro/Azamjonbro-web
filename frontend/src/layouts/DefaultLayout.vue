<template>
  <div class="min-h-screen flex flex-col bg-brand-dark text-slate-100 relative">
    <!-- Three.js interactive canvas particle background -->
    <BackgroundCanvas />

    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 bg-brand-dark/60 backdrop-blur-md border-b border-brand-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-300">
            A
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
            AzamjonBro Lab
          </span>
        </router-link>

        <!-- Desktop Menu with Sliding Underline -->
        <nav ref="navRef" class="hidden md:flex items-center gap-6 relative py-2">
          <!-- Sliding indicator bar -->
          <div 
            class="absolute bottom-0 h-[2px] bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300 ease-out pointer-events-none"
            :style="indicatorStyle"
          ></div>

          <router-link to="/tools" class="nav-link" @mouseenter="hoverNavLink" @mouseleave="resetNavLink">
            {{ $t('nav.tools') }}
          </router-link>
          <router-link to="/learning" class="nav-link" @mouseenter="hoverNavLink" @mouseleave="resetNavLink">
            {{ $t('nav.learning') }}
          </router-link>
          <router-link to="/roadmap" class="nav-link" @mouseenter="hoverNavLink" @mouseleave="resetNavLink">
            {{ $t('nav.roadmap') }}
          </router-link>
          <router-link to="/startup" class="nav-link" @mouseenter="hoverNavLink" @mouseleave="resetNavLink">
            {{ $t('nav.startup') }}
          </router-link>
          <router-link to="/playground" class="nav-link" @mouseenter="hoverNavLink" @mouseleave="resetNavLink">
            {{ $t('nav.playground') }}
          </router-link>
          <router-link to="/blog" class="nav-link" @mouseenter="hoverNavLink" @mouseleave="resetNavLink">
            {{ $t('nav.blog') }}
          </router-link>
        </nav>

        <!-- Right Utilities -->
        <div class="hidden md:flex items-center gap-4">
          <!-- Live User Pulsing Count -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-brand-border text-xs text-brand-success font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>
            {{ liveViewers }} Online
          </div>

          <!-- Command Palette Trigger -->
          <button 
            @click="triggerSearch" 
            class="p-1.5 rounded-lg border border-brand-border bg-slate-900/60 hover:bg-slate-900 transition-colors text-slate-400 hover:text-white flex items-center gap-1.5"
            title="Open command palette (Cmd+K)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
            <kbd class="text-[9px] px-1 bg-slate-800 rounded font-mono text-slate-500">⌘K</kbd>
          </button>

          <!-- Language Selector -->
          <select v-model="$i18n.locale" @change="changeLocale" class="bg-slate-900 border border-brand-border text-xs rounded-lg px-2 py-1 text-slate-200 outline-none cursor-pointer">
            <option value="en">English</option>
            <option value="uz">O'zbek</option>
            <option value="ru">Русский</option>
          </select>

          <!-- Theme Toggler -->
          <button @click="toggleThemeWithFade" class="theme-toggle-btn p-1.5 rounded-lg border border-brand-border bg-slate-900/60 hover:bg-slate-900 transition-colors text-slate-300 hover:text-white">
            <svg v-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          </button>

          <!-- Auth CTA / Dashboard -->
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
            <router-link v-if="authStore.isAdmin" to="/admin" class="text-xs text-brand-secondary border border-brand-secondary/40 hover:border-brand-secondary px-2.5 py-1 rounded-md transition-all font-medium">
              {{ $t('nav.admin') }}
            </router-link>
            <router-link to="/dashboard" class="flex items-center gap-2 group">
              <img :src="authStore.user?.avatar_url" class="w-8 h-8 rounded-full border border-brand-primary" alt="avatar" />
            </router-link>
            <button @click="handleLogout" class="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-900 transition-colors">
              {{ $t('nav.logout') }}
            </button>
          </div>
          <div v-else class="flex items-center gap-3">
            <router-link to="/auth/login" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              {{ $t('nav.login') }}
            </router-link>
            <router-link to="/auth/register" class="text-sm font-medium bg-brand-primary hover:bg-brand-primary/95 text-white px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-brand-primary/10">
              {{ $t('nav.register') }}
            </router-link>
          </div>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button 
          @click="toggleMobileDrawer" 
          class="md:hidden flex flex-col gap-1.5 justify-center items-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all relative z-50"
        >
          <span class="w-6 h-[2px] bg-current transition-transform duration-300 origin-center" :class="{ 'translate-y-[8px] rotate-45': mobileOpen }"></span>
          <span class="w-6 h-[2px] bg-current transition-opacity duration-300" :class="{ 'opacity-0': mobileOpen }"></span>
          <span class="w-6 h-[2px] bg-current transition-transform duration-300 origin-center" :class="{ 'translate-y-[-8px] -rotate-45': mobileOpen }"></span>
        </button>
      </div>
    </header>

    <!-- Mobile Drawer Menu -->
    <Transition name="drawer">
      <div v-if="mobileOpen" class="md:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-lg flex flex-col justify-between p-6 pt-24">
        <div class="space-y-6">
          <nav class="flex flex-col gap-4 text-xl font-bold tracking-wide">
            <router-link to="/tools" @click="mobileOpen = false" class="mobile-nav-link">🛠️ {{ $t('nav.tools') }}</router-link>
            <router-link to="/learning" @click="mobileOpen = false" class="mobile-nav-link">📖 {{ $t('nav.learning') }}</router-link>
            <router-link to="/roadmap" @click="mobileOpen = false" class="mobile-nav-link">🗺️ {{ $t('nav.roadmap') }}</router-link>
            <router-link to="/startup" @click="mobileOpen = false" class="mobile-nav-link">⚡ {{ $t('nav.startup') }}</router-link>
            <router-link to="/playground" @click="mobileOpen = false" class="mobile-nav-link">🛡️ {{ $t('nav.playground') }}</router-link>
            <router-link to="/blog" @click="mobileOpen = false" class="mobile-nav-link">✍️ {{ $t('nav.blog') }}</router-link>
            <router-link v-if="authStore.isAuthenticated" to="/dashboard" @click="mobileOpen = false" class="mobile-nav-link">⚙️ {{ $t('nav.dashboard') }}</router-link>
          </nav>
        </div>

        <div class="flex flex-col gap-4 border-t border-brand-border pt-6">
          <div class="flex justify-between items-center">
            <!-- Language Switcher -->
            <select v-model="$i18n.locale" @change="changeLocale" class="bg-slate-900 border border-brand-border text-sm rounded-lg px-3 py-1.5 text-slate-200">
              <option value="en">English</option>
              <option value="uz">O'zbek</option>
              <option value="ru">Русский</option>
            </select>
            <!-- Theme Toggle -->
            <button @click="toggleThemeWithFade" class="px-4 py-1.5 rounded-lg border border-brand-border bg-slate-900 text-slate-300 font-semibold text-xs transition-colors">
              {{ themeStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
            </button>
          </div>

          <div v-if="authStore.isAuthenticated" class="flex flex-col gap-2">
            <button @click="handleLogout" class="w-full text-center py-2.5 bg-slate-900 rounded-lg text-sm text-slate-400 hover:text-white">
              {{ $t('nav.logout') }}
            </button>
          </div>
          <div v-else class="flex flex-col gap-2">
            <router-link to="/auth/login" @click="mobileOpen = false" class="w-full text-center py-2 bg-slate-900 rounded-lg text-sm font-medium">
              {{ $t('nav.login') }}
            </router-link>
            <router-link to="/auth/register" @click="mobileOpen = false" class="w-full text-center py-2.5 bg-brand-primary rounded-lg text-sm font-medium text-white">
              {{ $t('nav.register') }}
            </router-link>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Viewport with Page Transition -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="page-fade-scale" mode="out-in" @after-enter="onRouteTransitionComplete">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="border-t border-brand-border py-8 mt-auto bg-slate-950/20 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <div>
          &copy; 2026 AzamjonBro Lab. Built with Vue 3, Vite, Node.js.
        </div>
        <div class="flex gap-4">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
          <a href="https://github.com" target="_blank" class="hover:text-white transition-colors">GitHub Repository</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";
import { useRouter, useRoute } from "vue-router";
import BackgroundCanvas from "../shared/BackgroundCanvas.vue";
import { io } from "socket.io-client";
import Lenis from "lenis";


const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const route = useRoute();

const mobileOpen = ref(false);
const liveViewers = ref(15);
let socket: any;
let lenisInstance: Lenis | null = null;

// Underline indicators
const navRef = ref<HTMLElement | null>(null);
const indicatorStyle = ref({
  left: "0px",
  width: "0px",
  opacity: 0
});

function hoverNavLink(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  if (!el) return;
  indicatorStyle.value = {
    left: `${el.offsetLeft}px`,
    width: `${el.offsetWidth}px`,
    opacity: 1
  };
}

function resetNavLink() {
  alignIndicatorToActive();
}

function alignIndicatorToActive() {
  nextTick(() => {
    if (!navRef.value) return;
    const activeEl = navRef.value.querySelector(".router-link-active") as HTMLElement;
    if (activeEl) {
      indicatorStyle.value = {
        left: `${activeEl.offsetLeft}px`,
        width: `${activeEl.offsetWidth}px`,
        opacity: 1
      };
    } else {
      indicatorStyle.value.opacity = 0;
    }
  });
}

function triggerSearch() {
  // Trigger click on app CMD+K listener
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
}

function changeLocale(event: any) {
  const selected = event.target.value;
  localStorage.setItem("preferred_language", selected);
}

function handleLogout() {
  authStore.logout();
  mobileOpen.value = false;
  router.push("/");
}

function toggleMobileDrawer() {
  mobileOpen.value = !mobileOpen.value;
}

function toggleThemeWithFade() {
  document.documentElement.classList.add("theme-transitioning");
  themeStore.toggleTheme();
  setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 450);
}

function onRouteTransitionComplete() {
  // Tell page to hook up animations
  window.dispatchEvent(new CustomEvent("page-transition-complete"));
}

watch(() => route.path, () => {
  alignIndicatorToActive();
  // Scroll to top on navigation
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true });
  }
});

onMounted(() => {
  themeStore.initTheme();
  alignIndicatorToActive();

  // Initialize Lenis scroll
  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95
  });

  function raf(time: number) {
    lenisInstance?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Hook smooth anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute("href");
      if (targetId && targetId !== "#") {
        const target = document.querySelector(targetId) as HTMLElement;
        if (target) {
          lenisInstance?.scrollTo(target);
        }
      }
    });
  });

  // Connect socket connection for active viewers
  try {
    socket = io("http://localhost:3000/realtime", { transports: ["websocket"] });
    socket.on("active:viewers", (data: { count: number }) => {
      liveViewers.value = data.count;
    });
  } catch (e) {
    console.warn("WebSocket could not connect. Displaying mocked counter.", e);
  }
});

onUnmounted(() => {
  if (socket) socket.disconnect();
  if (lenisInstance) {
    lenisInstance.destroy();
  }
});
</script>

<style scoped>
.nav-link {
  @apply text-xs text-slate-400 hover:text-white transition-colors duration-300 font-semibold relative py-1 px-1 tracking-wider uppercase;
}
.nav-link.router-link-active {
  @apply text-white;
}

/* Mobile Link Staggers */
.mobile-nav-link {
  @apply block py-2 border-b border-white/[0.03] text-slate-300 hover:text-white transition-colors;
}

/* Drawer slide transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
