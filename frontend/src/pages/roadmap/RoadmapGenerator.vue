<template>
  <div class="max-w-xl mx-auto space-y-8 py-8">
    <div class="text-center space-y-2">
      <div class="w-12 h-12 rounded-full bg-brand-success/15 border border-brand-success/30 flex items-center justify-center text-brand-success mx-auto mb-2 text-xl font-bold">
        🗺️
      </div>
      <h1 class="text-3xl font-extrabold text-white">AI Roadmap Generator</h1>
      <p class="text-xs text-slate-400">
        Construct custom step-by-step career timelines, recommended tools, and mock interview preparations.
      </p>
    </div>

    <!-- Stepper indicator -->
    <div class="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 max-w-xs mx-auto">
      <div :class="activeStep === 1 ? 'text-brand-success font-bold' : ''" class="transition-colors">1. Goals</div>
      <div class="h-[1px] bg-slate-800 flex-grow"></div>
      <div :class="activeStep === 2 ? 'text-brand-success font-bold' : ''" class="transition-colors">2. Setup</div>
    </div>

    <!-- Generator Form Panel -->
    <div class="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden min-h-[300px]">
      <div class="absolute inset-0 bg-brand-success/5 blur-2xl rounded-full -z-10 w-[30%] left-0"></div>

      <!-- Step 1 Layout -->
      <div v-if="activeStep === 1" class="space-y-6 step-container">
        <div class="space-y-4">
          <!-- Floating label input 1 -->
          <div class="relative pt-4">
            <input 
              v-model="form.desired_role" 
              type="text" 
              id="desired_role"
              required
              class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2.5 text-white outline-none focus:border-brand-success focus:ring-1 focus:ring-brand-success/40 transition-all peer placeholder-transparent"
              placeholder="Desired Engineering Role"
            />
            <label 
              for="desired_role" 
              class="absolute left-3 top-0 text-[10px] text-slate-500 font-bold uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-6 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-brand-success"
            >
              Desired Engineering Role
            </label>
          </div>

          <!-- Floating label input 2 -->
          <div class="relative pt-4">
            <input 
              v-model="form.current_skills" 
              type="text" 
              id="current_skills"
              required
              class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2.5 text-white outline-none focus:border-brand-success focus:ring-1 focus:ring-brand-success/40 transition-all peer placeholder-transparent"
              placeholder="Current Skills"
            />
            <label 
              for="current_skills" 
              class="absolute left-3 top-0 text-[10px] text-slate-500 font-bold uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-6 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-brand-success"
            >
              Current Skills
            </label>
          </div>
        </div>

        <button 
          @click="goNext"
          :disabled="!form.desired_role || !form.current_skills"
          class="w-full py-2.5 bg-brand-success text-xs font-bold text-white rounded-xl hover:bg-brand-success/90 active:scale-[0.99] transition-all disabled:opacity-40"
        >
          Next Step &rarr;
        </button>
      </div>

      <!-- Step 2 Layout -->
      <div v-if="activeStep === 2" class="space-y-6 step-container">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Experience Level</label>
            <select v-model="form.experience_level" class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2.5 text-slate-200 outline-none focus:border-brand-success">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Weekly Commitment</label>
            <select v-model="form.time_available" class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2.5 text-slate-200 outline-none focus:border-brand-success">
              <option value="5-10 hours/week">5-10 hours/week</option>
              <option value="10-20 hours/week">10-20 hours/week</option>
              <option value="20-40 hours/week">Full-time focus</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3">
          <button 
            @click="activeStep = 1"
            class="w-1/3 py-2.5 border border-brand-border bg-slate-900 text-xs text-slate-300 font-semibold rounded-xl"
          >
            &larr; Back
          </button>
          
          <button 
            @click="handleSubmit"
            :disabled="roadmapStore.loading" 
            class="flex-grow py-2.5 bg-brand-success text-xs font-bold text-white rounded-xl hover:bg-brand-success/95 active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg shadow-brand-success/15"
          >
            {{ roadmapStore.loading ? $t('common.loading') : 'Generate Roadmap' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Privacy details -->
    <div class="text-[10px] text-center text-slate-500">
      Private generation pipelines. Authenticated users can archive roadmaps directly to profiles.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useRoadmapStore } from "../../stores/roadmap";
import { useRouter } from "vue-router";
import { gsap } from "gsap";

const roadmapStore = useRoadmapStore();
const router = useRouter();

const activeStep = ref(1);

const form = ref({
  desired_role: "",
  current_skills: "",
  experience_level: "beginner",
  time_available: "10-20 hours/week"
});

async function goNext() {
  if (!form.value.desired_role || !form.value.current_skills) return;
  activeStep.value = 2;
  
  await nextTick();
  gsap.from(".step-container", {
    opacity: 0,
    x: 20,
    duration: 0.4,
    ease: "power2.out"
  });
}

async function handleSubmit() {
  try {
    const roadmap = await roadmapStore.generateRoadmap(form.value);
    if (roadmap) {
      router.push({ name: "roadmap-detail", params: { token: roadmap.share_token } });
    }
  } catch (error) {
    console.error("Roadmap compilation error:", error);
  }
}
</script>
