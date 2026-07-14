import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../services/api";

export interface ValidationReport {
  id: string;
  share_token: string;
  idea_description: string;
  validation_report: any;
  created_at: string;
}

export const useValidationStore = defineStore("validation", () => {
  const activeValidation = ref<ValidationReport | null>(null);
  const savedValidations = ref<ValidationReport[]>([]);
  const loading = ref(false);

  async function validateIdea(ideaDescription: string) {
    loading.value = true;
    try {
      const response = await api.post("/startup-validation/validate", { idea_description: ideaDescription });
      const generated = response.data.data;
      activeValidation.value = {
        id: generated.id,
        share_token: generated.shareToken,
        idea_description: generated.idea_description,
        validation_report: generated.validation_report,
        created_at: new Date().toISOString()
      };
      return activeValidation.value;
    } finally {
      loading.value = false;
    }
  }

  async function fetchValidationByToken(token: string) {
    loading.value = true;
    try {
      const response = await api.get(`/startup-validation/${token}`);
      activeValidation.value = response.data.data;
      return activeValidation.value;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSavedValidations() {
    loading.value = true;
    try {
      const response = await api.get("/startup-validation/saved");
      savedValidations.value = response.data.data;
    } catch (e) {
      console.error("Failed to load saved startup validations:", e);
    } finally {
      loading.value = false;
    }
  }

  return {
    activeValidation,
    savedValidations,
    loading,
    validateIdea,
    fetchValidationByToken,
    fetchSavedValidations
  };
});
