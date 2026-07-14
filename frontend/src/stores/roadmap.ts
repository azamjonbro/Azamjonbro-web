import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../services/api";

export interface Roadmap {
  id: string;
  share_token: string;
  desired_role: string;
  current_skills: string;
  time_available: string;
  experience_level: string;
  roadmap_data: any[];
  created_at: string;
}

export const useRoadmapStore = defineStore("roadmap", () => {
  const activeRoadmap = ref<Roadmap | null>(null);
  const savedRoadmaps = ref<Roadmap[]>([]);
  const loading = ref(false);

  async function generateRoadmap(data: { current_skills: string; desired_role: string; time_available: string; experience_level: string }) {
    loading.value = true;
    try {
      const response = await api.post("/roadmaps/generate", data);
      const generated = response.data.data;
      activeRoadmap.value = {
        id: generated.id,
        share_token: generated.shareToken,
        desired_role: generated.desired_role,
        current_skills: data.current_skills,
        time_available: data.time_available,
        experience_level: data.experience_level,
        roadmap_data: generated.roadmap_data,
        created_at: new Date().toISOString()
      };
      return activeRoadmap.value;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRoadmapByToken(token: string) {
    loading.value = true;
    try {
      const response = await api.get(`/roadmaps/${token}`);
      activeRoadmap.value = response.data.data;
      return activeRoadmap.value;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSavedRoadmaps() {
    loading.value = true;
    try {
      const response = await api.get("/roadmaps/saved");
      savedRoadmaps.value = response.data.data;
    } catch (e) {
      console.error("Failed to load saved roadmaps:", e);
    } finally {
      loading.value = false;
    }
  }

  return {
    activeRoadmap,
    savedRoadmaps,
    loading,
    generateRoadmap,
    fetchRoadmapByToken,
    fetchSavedRoadmaps
  };
});
