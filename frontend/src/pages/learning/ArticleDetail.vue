<template>
  <div class="max-w-3xl mx-auto space-y-8 py-4 relative">
    <!-- Reading Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-[3px] bg-slate-900 z-50">
      <div class="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-75" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <div v-if="loading" class="text-center py-24">
      <div class="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin mx-auto mb-4"></div>
      <p class="text-xs text-slate-500">Loading article...</p>
    </div>

    <div v-else-if="article" class="space-y-8">
      <!-- Article Header -->
      <div class="space-y-4 border-b border-brand-border pb-6">
        <div class="flex gap-2 items-center">
          <router-link to="/learning" class="text-xs text-brand-primary font-bold hover:underline">
            &larr; Back to Subjects
          </router-link>
          <span class="text-slate-600">/</span>
          <span class="text-xs text-slate-400 capitalize">{{ article.category_slug }}</span>
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
          <button @click="toggleBookmark" class="flex items-center gap-1 text-xs text-brand-primary hover:text-white font-semibold">
            <span>{{ isBookmarked ? '★ Bookmarked' : '☆ Bookmark' }}</span>
          </button>
        </div>
      </div>

      <!-- Article Image -->
      <img 
        :src="article.featured_image || 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1200&q=80'" 
        class="w-full h-72 object-cover rounded-2xl border border-brand-border"
        alt="banner"
      />

      <!-- Content (Simple Custom Markdown Parser) -->
      <article class="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
        <div v-html="parsedContent"></div>
      </article>

      <!-- Comments Segment -->
      <div class="border-t border-brand-border pt-8 space-y-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          💬 Comments ({{ commentsCount }})
        </h3>

        <!-- Comment Posting Drawer -->
        <div v-if="authStore.isAuthenticated" class="space-y-3">
          <textarea 
            v-model="newCommentText" 
            placeholder="Write your constructive response..." 
            class="w-full h-24 bg-slate-950 border border-brand-border text-xs rounded-lg p-3 text-white outline-none focus:border-brand-primary"
          ></textarea>
          <div class="flex justify-end">
            <button @click="postComment" :disabled="!newCommentText.trim()" class="px-5 py-2 bg-brand-primary text-xs font-bold text-white rounded-lg hover:bg-brand-primary/95 transition-all disabled:opacity-50">
              Submit Response
            </button>
          </div>
        </div>
        <div v-else class="bg-slate-900/40 p-4 border border-brand-border rounded-xl text-center text-xs text-slate-400">
          Please <router-link to="/auth/login" class="text-brand-primary font-bold">Sign In</router-link> to participate in community discussions.
        </div>

        <!-- Threaded Comments Tree -->
        <div class="space-y-4">
          <div v-for="c in commentTree" :key="c.id" class="space-y-4">
            <!-- Parent comment -->
            <div class="glass-panel p-4 space-y-2 border-slate-800">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <img :src="c.user_avatar" class="w-6 h-6 rounded-full border border-brand-primary" />
                  <span class="font-bold text-slate-200">{{ c.user_name }}</span>
                </div>
                <span class="text-[10px] text-slate-500">{{ new Date(c.created_at).toLocaleString() }}</span>
              </div>
              <p class="text-xs text-slate-300">{{ c.content }}</p>
              
              <div class="flex gap-3 justify-end pt-1">
                <button v-if="authStore.isAuthenticated" @click="activeReplyId = c.id" class="text-[10px] text-brand-primary font-bold hover:underline">
                  Reply
                </button>
                <button v-if="authStore.user?.role === 'admin' || authStore.user?.id === c.user_id" @click="deleteComment(c.id)" class="text-[10px] text-brand-error font-bold hover:underline">
                  Delete
                </button>
              </div>

              <!-- Inline reply input -->
              <div v-if="activeReplyId === c.id" class="mt-3 space-y-2 border-t border-brand-border/40 pt-3">
                <textarea v-model="replyText" placeholder="Write reply..." class="w-full h-16 bg-slate-950 border border-brand-border text-xs rounded-lg p-2 text-white outline-none focus:border-brand-primary"></textarea>
                <div class="flex justify-end gap-2">
                  <button @click="activeReplyId = null" class="px-3 py-1 border border-brand-border text-[10px] text-slate-400 rounded-md">Cancel</button>
                  <button @click="postReply(c.id)" :disabled="!replyText.trim()" class="px-3 py-1 bg-brand-primary text-white text-[10px] font-bold rounded-md disabled:opacity-50">Submit</button>
                </div>
              </div>
            </div>

            <!-- Children responses nested inside -->
            <div v-if="c.replies && c.replies.length > 0" class="pl-8 border-l border-brand-border/40 space-y-4">
              <div v-for="reply in c.replies" :key="reply.id" class="glass-panel p-4 space-y-2 bg-slate-950/20 border-slate-900">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <img :src="reply.user_avatar" class="w-6 h-6 rounded-full border border-brand-secondary" />
                    <span class="font-bold text-slate-200">{{ reply.user_name }}</span>
                  </div>
                  <span class="text-[10px] text-slate-500">{{ new Date(reply.created_at).toLocaleString() }}</span>
                </div>
                <p class="text-xs text-slate-300">{{ reply.content }}</p>
                <div v-if="authStore.user?.role === 'admin' || authStore.user?.id === reply.user_id" class="flex justify-end">
                  <button @click="deleteComment(reply.id)" class="text-[10px] text-brand-error font-bold hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="commentTree.length === 0" class="text-center py-6 text-xs text-slate-500">
            No responses yet. Start the discussion!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useBlogStore } from "../../stores/blog";
import { useAuthStore } from "../../stores/auth";
import { useRoute } from "vue-router";
import api from "../../services/api";

const blogStore = useBlogStore();
const authStore = useAuthStore();
const route = useRoute();

const loading = ref(true);
const article = ref<any>(null);
const scrollProgress = ref(0);

// Comment inputs
const commentTree = ref<any[]>([]);
const newCommentText = ref("");
const activeReplyId = ref<string | null>(null);
const replyText = ref("");

const isBookmarked = computed(() => {
  if (!article.value) return false;
  return blogStore.bookmarks.some(bk => bk.bookmarkable_id === article.value.id);
});

const commentsCount = computed(() => {
  let count = commentTree.value.length;
  commentTree.value.forEach(c => {
    if (c.replies) count += c.replies.length;
  });
  return count;
});

// Simple custom regex-based markdown parser
const parsedContent = computed(() => {
  if (!article.value) return "";
  let raw = article.value.content_en; // Fallback to english
  
  // Headers
  raw = raw.replace(/### (.*)/g, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>');
  
  // Lists
  raw = raw.replace(/^- (.*)/g, '<li class="list-disc ml-5 text-slate-300 my-1">$1</li>');

  // Syntax block formatting
  raw = raw.replace(/```typescript([\s\S]*?)```/g, '<pre class="bg-slate-950 border border-brand-border rounded-xl p-4 my-4 overflow-x-auto"><code class="text-xs text-cyan-400 font-mono">$1</code></pre>');
  raw = raw.replace(/```javascript([\s\S]*?)```/g, '<pre class="bg-slate-950 border border-brand-border rounded-xl p-4 my-4 overflow-x-auto"><code class="text-xs text-yellow-400 font-mono">$1</code></pre>');
  
  // Inline code tags
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
    console.error("Failed to load article detail:", e);
  } finally {
    loading.value = false;
  }
}

async function fetchComments() {
  if (!article.value) return;
  try {
    const res = await api.get(`/comments?articleId=${article.value.id}`);
    commentTree.value = res.data.data;
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

async function postReply(parentId: string) {
  if (!replyText.value.trim() || !article.value) return;
  try {
    await api.post("/comments", {
      article_id: article.value.id,
      content: replyText.value,
      parent_id: parentId
    });
    replyText.value = "";
    activeReplyId.value = null;
    await fetchComments();
  } catch (e) {
    alert("Failed to submit reply.");
  }
}

async function deleteComment(id: string) {
  if (!confirm("Are you sure you want to delete this comment?")) return;
  try {
    await api.delete(`/comments/${id}`);
    await fetchComments();
  } catch (e) {
    alert("Could not delete comment.");
  }
}

async function toggleBookmark() {
  if (!article.value) return;
  try {
    await blogStore.toggleBookmark("article", article.value.id);
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
