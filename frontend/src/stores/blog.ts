import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../services/api";

export interface Article {
  id: string;
  slug: string;
  category_id: string;
  title_uz: string;
  title_en: string;
  title_ru: string;
  content_uz: string;
  content_en: string;
  content_ru: string;
  featured_image: string | null;
  author_name: string;
  read_time_minutes: number;
  views_count: number;
  published_at: string;
  tags?: Array<{ id: string; name: string }>;
  category_slug?: string;
  category_name_en?: string;
  category_name_uz?: string;
}

export interface Category {
  id: string;
  slug: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
}

export const useBlogStore = defineStore("blog", () => {
  const articles = ref<Article[]>([]);
  const categories = ref<Category[]>([]);
  const bookmarks = ref<any[]>([]);
  const loading = ref(false);
  const totalArticles = ref(0);

  async function fetchArticles(params?: { category?: string; tag?: string; search?: string; page?: number; limit?: number }) {
    loading.value = true;
    try {
      const response = await api.get("/blog/articles", { params });
      articles.value = response.data.data;
      totalArticles.value = response.data.meta?.total || 0;
    } catch (e) {
      console.error("Failed to load blog articles:", e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.get("/blog/categories");
      categories.value = response.data.data;
    } catch (e) {
      console.error("Failed to load blog categories:", e);
    }
  }

  async function fetchBookmarks() {
    try {
      const response = await api.get("/users/bookmarks");
      bookmarks.value = response.data.data;
    } catch (e) {
      console.error("Failed to fetch user bookmarks:", e);
    }
  }

  async function toggleBookmark(type: "article" | "roadmap" | "validation", id: string) {
    try {
      const response = await api.post("/users/bookmarks/toggle", {
        bookmarkable_type: type,
        bookmarkable_id: id
      });
      await fetchBookmarks();
      return response.data.data;
    } catch (e) {
      console.error("Failed to toggle bookmark:", e);
    }
  }

  return {
    articles,
    categories,
    bookmarks,
    loading,
    totalArticles,
    fetchArticles,
    fetchCategories,
    fetchBookmarks,
    toggleBookmark
  };
});
