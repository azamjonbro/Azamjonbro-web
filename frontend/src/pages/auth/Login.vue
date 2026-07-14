<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h2 class="text-xl font-bold text-white">Welcome Back</h2>
      <p class="text-xs text-slate-400">Sign in to sync your tools logs, roadmaps, and profile bookmarks.</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div v-if="error" class="text-xs text-brand-error bg-brand-error/15 border border-brand-error/25 p-3 rounded-lg">
        {{ error }}
      </div>

      <div>
        <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Email address</label>
        <input 
          v-model="email" 
          type="email" 
          placeholder="admin@azamjonbro.uz"
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
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <div class="text-center text-xs text-slate-500 border-t border-brand-border pt-4">
      New to AzamjonBro Lab? 
      <router-link to="/auth/register" class="text-brand-primary font-bold hover:underline">Create Account</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter, useRoute } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
    
    // Redirect to redirect query param or dashboard
    const nextRoute = (route.query.redirect as string) || "/dashboard";
    router.push(nextRoute);
  } catch (err: any) {
    error.value = err.response?.data?.message || "Invalid credentials.";
  } finally {
    loading.value = false;
  }
}
</script>
