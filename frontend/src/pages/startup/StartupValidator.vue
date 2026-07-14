<template>
  <div class="max-w-xl mx-auto space-y-8 py-8">
    <div class="text-center space-y-2">
      <div class="w-12 h-12 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-500 mx-auto mb-2 text-xl font-bold">
        ⚡
      </div>
      <h1 class="text-3xl font-extrabold text-white">Startup Validation Platform</h1>
      <p class="text-xs text-slate-400">
        Submit your technology startup concept. Generate market models (TAM, SAM), SWOT matrix analysis, and MVP scope suggestions.
      </p>
    </div>

    <!-- Pitch panel -->
    <div class="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden">
      <div class="absolute inset-0 bg-yellow-500/5 blur-2xl rounded-full -z-10 w-[30%] right-0"></div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Floating Label Textarea -->
        <div class="relative pt-4">
          <textarea 
            v-model="ideaDescription" 
            id="idea_description"
            required
            minlength="10"
            class="w-full h-36 bg-slate-950 border border-brand-border text-xs rounded-lg p-3 text-white outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/40 transition-all peer placeholder-transparent"
            placeholder="Pitch Your Startup Concept"
          ></textarea>
          <label 
            for="idea_description" 
            class="absolute left-3 top-0 text-[10px] text-slate-500 font-bold uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-8 peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-yellow-500"
          >
            Pitch Your Startup Concept
          </label>
          
          <div class="flex justify-between items-center text-[10px] text-slate-500 mt-1">
            <span>Write at least 10 characters to initialize business audits.</span>
            <span>{{ ideaDescription.length }} chars</span>
          </div>
        </div>

        <!-- Submit Button morphs into load ring -->
        <button 
          type="submit" 
          :disabled="validationStore.loading" 
          class="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-xs font-bold text-slate-950 rounded-xl active:scale-[0.99] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2"
        >
          <span v-if="validationStore.loading" class="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
          <span>{{ validationStore.loading ? $t('common.loading') : 'Validate Concept' }}</span>
        </button>
      </form>
    </div>

    <!-- Security disclosures -->
    <div class="text-[10px] text-center text-slate-500">
      Your pitches are evaluated securely. Authenticated users can review stored validation histories.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useValidationStore } from "../../stores/validation";
import { useRouter } from "vue-router";

const validationStore = useValidationStore();
const router = useRouter();

const ideaDescription = ref("");

async function handleSubmit() {
  try {
    const report = await validationStore.validateIdea(ideaDescription.value);
    if (report) {
      router.push({ name: "startup-detail", params: { token: report.share_token } });
    }
  } catch (error) {
    console.error("Startup validation compilation failed:", error);
  }
}
</script>
