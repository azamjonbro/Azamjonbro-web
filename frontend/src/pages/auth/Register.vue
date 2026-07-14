<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h2 class="text-xl font-bold text-white">Create Account</h2>
      <p class="text-xs text-slate-400">Join the premium developer platform. Tracks histories and milestones.</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div v-if="error" class="text-xs text-brand-error bg-brand-error/15 border border-brand-error/25 p-3 rounded-lg">
        {{ error }}
      </div>

      <div>
        <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Full Name</label>
        <input 
          v-model="fullName" 
          type="text" 
          placeholder="Sherzod Karimov"
          class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-primary"
          required
        />
      </div>

      <div>
        <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Email address</label>
        <input 
          v-model="email" 
          type="email" 
          placeholder="sherzod@dev.uz"
          class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-primary font-mono"
          required
        />
      </div>

      <div>
        <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Password</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="••••••••"
          class="w-full bg-slate-950 border border-brand-border text-xs rounded-lg px-3 py-2 text-white outline-none focus:border-brand-primary"
          required
        />
      </div>

      <button 
        type="submit" 
        :disabled="loading" 
        class="w-full py-2.5 bg-brand-primary text-xs font-bold text-white rounded-lg hover:bg-brand-primary/95 transition-all disabled:opacity-50 mt-2"
      >
        {{ loading ? 'Creating...' : 'Register' }}
      </button>
    </form>

    <div class="text-center text-xs text-slate-500 border-t border-brand-border pt-4">
      Already have an account? 
      <router-link to="/auth/login" class="text-brand-primary font-bold hover:underline">Sign In</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const fullName = ref("");
const error = ref("");
const loading = ref(false);

async function handleRegister() {
  error.value = "";
  loading.value = true;
  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      full_name: fullName.value
    });
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.response?.data?.message || "Failed to create account.";
  } finally {
    loading.value = false;
  }
}
</script>
