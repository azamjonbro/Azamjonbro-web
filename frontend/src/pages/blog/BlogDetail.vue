<template>
  <div class="max-w-3xl mx-auto space-y-8 py-4 relative">
    <!-- Reading Progress Bar with Neon Glow -->
    <div class="fixed top-0 left-0 w-full h-[3px] bg-slate-950 z-[99999]">
      <div 
        class="h-full bg-gradient-to-r from-cyan-400 via-brand-primary to-brand-secondary transition-all duration-75 shadow-[0_0_10px_#22d3ee]" 
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Shimmer skeleton for detail loading -->
    <div v-if="loading" class="space-y-6 py-12">
      <div class="space-y-3">
        <div class="skeleton-shimmer w-24 h-4 rounded"></div>
        <div class="skeleton-shimmer w-full h-10 rounded"></div>
        <div class="skeleton-shimmer w-1/2 h-4 rounded"></div>
      </div>
      <div class="skeleton-shimmer w-full h-72 rounded-2xl"></div>
      <div class="space-y-3">
        <div class="skeleton-shimmer w-full h-4 rounded"></div>
        <div class="skeleton-shimmer w-full h-4 rounded"></div>
        <div class="skeleton-shimmer w-4/5 h-4 rounded"></div>
      </div>
    </div>

    <div v-else-if="article" class="space-y-8">
      <!-- Article Header -->
      <div class="space-y-4 border-b border-brand-border pb-6">
        <div class="flex gap-2 items-center">
          <router-link to="/blog" class="text-xs text-cyan-400 font-bold hover:underline">
            &larr; Back to Blog Index
          </router-link>
          <span class="text-slate-600">/</span>
          <span class="text-xs text-slate-400 capitalize">{{ article.category_slug || 'Tech' }}</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          {{ article.title_en }}
        </h1>
        <div class="flex items-center justify-between text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-200">{{ article.author_name }}</span>
            <span>&bull;</span>
            <span>{{ new Date(article.published_at).toLocaleDateString() }}</span>
            <span>&bull;</span>
            <span>{{ article.read_time_minutes }} min read</span>
          </div>
          <button @click="handleToggleBookmark" class="flex items-center gap-1 text-xs text-cyan-400 hover:text-white font-semibold transition-colors">
            <span>{{ isBookmarked ? '★ Bookmarked' : '☆ Bookmark' }}</span>
          </button>
        </div>
      </div>

      <!-- Article Image -->
      <img 
        :src="article.featured_image || 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1200&q=80'" 
        class="w-full h-72 object-cover rounded-2xl border border-brand-border hover:scale-[1.005] transition-transform duration-500"
        alt="banner"
      />

      <!-- Content (Simple Custom Markdown Parser) -->
      <article class="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
        <div v-html="parsedContent" class="markdown-body"></div>
      </article>

      <!-- Comments Segment -->
      <div class="border-t border-brand-border pt-8 space-y-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          💬 Discussion ({{ commentTree.length }})
        </h3>

        <!-- Comment Posting Drawer -->
        <div v-if="authStore.isAuthenticated" class="space-y-3">
          <textarea 
            v-model="newCommentText" 
            placeholder="Participate in this discussion thread..." 
            class="w-full h-24 bg-slate-950 border border-brand-border text-xs rounded-lg p-3 text-white outline-none focus:border-cyan-400 transition-all focus:scale-[1.005]"
          ></textarea>
          <div class="flex justify-end">
            <button @click="postComment" :disabled="!newCommentText.trim()" class="px-5 py-2 bg-cyan-400 text-xs font-bold text-slate-950 rounded-lg hover:bg-cyan-400/90 transition-all disabled:opacity-50">
              Submit Response
            </button>
          </div>
        </div>
        <div v-else class="bg-slate-900/40 p-4 border border-brand-border rounded-xl text-center text-xs text-slate-400">
          Please <router-link to="/auth/login" class="text-cyan-400 font-bold">Sign In</router-link> to participate in discussions.
        </div>

        <!-- Threaded Comments Tree -->
        <div class="space-y-4 comment-list">
          <div 
            v-for="c in commentTree" 
            :key="c.id" 
            class="glass-panel p-4 space-y-2 border-slate-800 comment-item"
          >
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <img :src="c.user_avatar" class="w-6 h-6 rounded-full border border-brand-primary" />
                <span class="font-bold text-slate-200">{{ c.user_name }}</span>
              </div>
              <span class="text-[10px] text-slate-500">{{ new Date(c.created_at).toLocaleString() }}</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">{{ c.content }}</p>
            <div v-if="authStore.user?.role === 'admin' || authStore.user?.id === c.user_id" class="flex justify-end">
              <button @click="deleteComment(c.id)" class="text-[10px] text-brand-error font-bold hover:underline">
                Delete
              </button>
            </div>
          </div>

          <div v-if="commentTree.length === 0" class="text-center py-6 text-xs text-slate-500">
            No responses yet.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useBlogStore } from "../../stores/blog";
import { useAuthStore } from "../../stores/auth";
import { useRoute } from "vue-router";
import { triggerConfetti } from "../../utils/animation";
import { gsap } from "gsap";
import api from "../../services/api";

const blogStore = useBlogStore();
const authStore = useAuthStore();
const route = useRoute();

const loading = ref(true);
const article = ref<any>(null);
const scrollProgress = ref(0);

const commentTree = ref<any[]>([]);
const newCommentText = ref("");

const isBookmarked = computed(() => {
  if (!article.value) return false;
  return blogStore.bookmarks.some(bk => bk.bookmarkable_id === article.value.id);
});

const parsedContent = computed(() => {
  if (!article.value) return "";
  let raw = article.value.content_en;
  raw = raw.replace(/### (.*)/g, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>');
  raw = raw.replace(/^- (.*)/g, '<li class="list-disc ml-5 text-slate-300 my-1">$1</li>');
  raw = raw.replace(/```typescript([\s\S]*?)```/g, '<pre class="bg-slate-950 border border-brand-border rounded-xl p-4 my-4 overflow-x-auto"><code class="text-xs text-cyan-400 font-mono">$1</code></pre>');
  raw = raw.replace(/```javascript([\s\S]*?)```/g, '<pre class="bg-slate-950 border border-brand-border rounded-xl p-4 my-4 overflow-x-auto"><code class="text-xs text-yellow-400 font-mono">$1</code></pre>');
  raw = raw.replace(/`([^`]+)`/g, '<code class="bg-slate-900 border border-brand-border text-xs px-1.5 py-0.5 rounded text-brand-secondary font-mono">$1</code>');
  return raw;
});

async function loadArticle() {
  loading.value = true;
  try {
    const slug = route.params.slug as string;
    const res = await api.get(`/blog/articles/${slug}`);
    article.value = res.data.data;
    await fetchComments();
  } catch (e) {
    console.error("Failed to load blog detail:", e);
  } finally {
    loading.value = false;
  }
}

async function fetchComments() {
  if (!article.value) return;
  try {
    const res = await api.get(`/comments?articleId=${article.value.id}`);
    commentTree.value = res.data.data;
    
    // Animate comments stagger after list rendering
    await nextTick();
    gsap.from(".comment-item", {
      opacity: 0,
      y: 15,
      stagger: 0.08,
      duration: 0.5,
      ease: "power2.out"
    });
  } catch (e) {
    console.error("Failed to load comments:", e);
  }
}

async function postComment() {
  if (!newCommentText.value.trim() || !article.value) return;
  try {
    await api.post("/comments", {
      article_id: article.value.id,
      content: newCommentText.value
    });
    newCommentText.value = "";
    await fetchComments();
  } catch (e) {
    alert("Could not post comment.");
  }
}

async function deleteComment(id: string) {
  if (!confirm("Delete this comment?")) return;
  try {
    await api.delete(`/comments/${id}`);
    await fetchComments();
  } catch (e) {
    alert("Could not delete comment.");
  }
}

async function handleToggleBookmark(e: MouseEvent) {
  if (!article.value) return;
  try {
    await blogStore.toggleBookmark("article", article.value.id);
    
    // Show confetti on successful bookmark toggle
    triggerConfetti(e.clientX, e.clientY);
  } catch (e) {
    alert("Please sign in to bookmark articles.");
  }
}

function handleScroll() {
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
}

onMounted(() => {
  loadArticle();
  blogStore.fetchBookmarks();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
