<template>
  <div>
    <!-- Route Progress Loader -->
    <div 
      v-if="isNavigating" 
      class="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-success z-[99999] transition-all duration-300"
      :style="{ width: `${pageProgress}%` }"
    ></div>

    <!-- Custom Cursor Follower -->
    <CursorExperience />

    <!-- Command Menu Modal (CMD+K) -->
    <CommandMenu v-model="commandMenuOpen" />

    <!-- Premium Preloader Sequence -->
    <Preloader v-if="showPreloader" @loaded="onPreloaderComplete" />

    <!-- Main Entry Gate -->
    <div :class="{ 'opacity-0 scale-95': showPreloader && !preloadedSession, 'transition-all duration-700 ease-out': true }">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Preloader from "./shared/Preloader.vue";
import CursorExperience from "./shared/CursorExperience.vue";
import CommandMenu from "./components/CommandMenu.vue";

const showPreloader = ref(true);
const preloadedSession = ref(false);
const commandMenuOpen = ref(false);

const isNavigating = ref(false);
const pageProgress = ref(0);
let progressInterval: any;

const router = useRouter();

function onPreloaderComplete() {
  showPreloader.value = false;
  preloadedSession.value = true;
}

// Router guards for top loading bar progress
router.beforeEach((_to, _from, next) => {
  isNavigating.value = true;
  pageProgress.value = 10;
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (pageProgress.value < 85) {
      pageProgress.value += Math.random() * 12;
    }
  }, 80);
  next();
});

router.afterEach(() => {
  pageProgress.value = 100;
  clearInterval(progressInterval);
  setTimeout(() => {
    isNavigating.value = false;
    pageProgress.value = 0;
  }, 250);
});

onMounted(() => {
  // Listen for global theme toggles from command menu
  window.addEventListener("toggle-theme", () => {
    const themeBtn = document.querySelector(".theme-toggle-btn");
    if (themeBtn) (themeBtn as HTMLButtonElement).click();
  });

  // Track if preloaded in session
  if (sessionStorage.getItem("preloaded") === "true") {
    showPreloader.value = false;
    preloadedSession.value = true;
  }
});
</script>
