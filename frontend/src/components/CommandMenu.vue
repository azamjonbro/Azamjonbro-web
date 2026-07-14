<template>
  <Transition name="fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 md:p-12"
      @click.self="close"
    >
      <div 
        ref="menuRef"
        class="w-full max-w-xl bg-slate-900/90 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-95 opacity-0 transition-all duration-300"
      >
        <!-- Search Input Header -->
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.05]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-slate-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Type a command or search tools..."
            class="flex-grow bg-transparent text-sm text-white outline-none border-none placeholder-slate-500 font-sans"
            ref="inputRef"
            @keydown.down.prevent="navigateResults(1)"
            @keydown.up.prevent="navigateResults(-1)"
            @keydown.enter.prevent="selectActive"
          />
          <kbd class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-white/[0.08] text-slate-400 font-mono">ESC</kbd>
        </div>

        <!-- Options / Suggestions list -->
        <div class="max-h-[340px] overflow-y-auto p-2 space-y-1.5 scrollbar-none">
          <!-- Commands Header -->
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1">
            {{ searchQuery ? 'Search Results' : 'Suggested Commands' }}
          </div>

          <div v-if="filteredCommands.length > 0" class="space-y-0.5">
            <button
              v-for="(cmd, idx) in filteredCommands"
              :key="cmd.id"
              @click="runCommand(cmd)"
              @mouseenter="activeIndex = idx"
              class="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group"
              :class="activeIndex === idx ? 'bg-white/[0.05] border-l-2 border-brand-primary' : 'border-l-2 border-transparent'"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg text-slate-300 group-hover:scale-110 transition-transform">{{ cmd.icon }}</span>
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-slate-200">{{ cmd.name }}</span>
                  <span class="text-[10px] text-slate-400">{{ cmd.desc }}</span>
                </div>
              </div>
              <span class="text-[9px] text-slate-500 font-bold uppercase">{{ cmd.category }}</span>
            </button>
          </div>

          <div v-else class="text-center py-8 text-xs text-slate-500">
            No commands match your query. Try searching for "jwt" or "auth".
          </div>
        </div>

        <!-- Menu Footer -->
        <div class="bg-slate-950/40 border-t border-white/[0.05] px-4 py-2.5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <div class="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>AzamjonBro Lab</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const isOpen = ref(false);
const searchQuery = ref("");
const activeIndex = ref(0);

const inputRef = ref<HTMLInputElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

const COMMANDS = [
  { id: "tools", name: "Developer Tools Directory", desc: "Open 23 offline-first coder utilities", icon: "🛠️", category: "Navigation", path: "/tools" },
  { id: "jwt", name: "JWT Token Decoder", desc: "Decode, parse and inspect JSON Web Tokens", icon: "🔑", category: "Tools", path: "/tools", action: "jwt_decoder" },
  { id: "json", name: "JSON Validator / Formatter", desc: "Clean and format minified JSON payloads", icon: "📦", category: "Tools", path: "/tools", action: "json_formatter" },
  { id: "roadmap", name: "AI Roadmap Generator", desc: "Build tailored study guidelines", icon: "🗺️", category: "Navigation", path: "/roadmap" },
  { id: "startup", name: "Venture Validator Platform", desc: "Generate SWOT reports and TAM projections", icon: "⚡", category: "Navigation", path: "/startup" },
  { id: "playground", name: "Cybersecurity Playground", desc: "Simulate database SQLi and XSS scripts", icon: "🛡️", category: "Navigation", path: "/playground" },
  { id: "blog", name: "Platform Devlogs", desc: "Read technical articles and software releases", icon: "✍️", category: "Navigation", path: "/blog" },
  { id: "theme", name: "Toggle Theme Mode", desc: "Cross-fade dark and light mode profiles", icon: "🌓", category: "Systems", callback: "toggleTheme" }
];

const filteredCommands = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return COMMANDS;
  return COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes(query) || 
    cmd.desc.toLowerCase().includes(query) ||
    cmd.category.toLowerCase().includes(query)
  );
});

// Watch filtering and reset index active
watch(filteredCommands, () => {
  activeIndex.value = 0;
});

watch(() => props.modelValue, (val) => {
  isOpen.value = val;
  if (val) {
    nextTick(() => {
      if (inputRef.value) inputRef.value.focus();
      if (menuRef.value) {
        gsap.to(menuRef.value, {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: "back.out(1.5)"
        });
      }
    });
  }
});

function close() {
  if (menuRef.value) {
    gsap.to(menuRef.value, {
      scale: 0.95,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        emit("update:modelValue", false);
      }
    });
  } else {
    emit("update:modelValue", false);
  }
}

function selectActive() {
  const activeCmd = filteredCommands.value[activeIndex.value];
  if (activeCmd) {
    runCommand(activeCmd);
  }
}

function runCommand(cmd: any) {
  close();
  if (cmd.path) {
    router.push(cmd.path);
  } else if (cmd.callback === "toggleTheme") {
    // Dispatch a custom theme switch event
    window.dispatchEvent(new CustomEvent("toggle-theme"));
  }
}

function navigateResults(dir: number) {
  const count = filteredCommands.value.length;
  if (count === 0) return;
  activeIndex.value = (activeIndex.value + dir + count) % count;
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    emit("update:modelValue", !props.modelValue);
  }
  if (e.key === "Escape" && props.modelValue) {
    close();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
