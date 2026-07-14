import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../services/api";

export interface ToolHistoryRecord {
  id: string;
  tool_type: string;
  input_data: any;
  output_data: any;
  created_at: string;
}

export const useToolsStore = defineStore("tools", () => {
  const history = ref<ToolHistoryRecord[]>([]);
  const loading = ref(false);

  // Generate or load unique browser fingerprint for guests
  function getFingerprint() {
    let fp = localStorage.getItem("guest_fingerprint");
    if (!fp) {
      fp = "fp_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("guest_fingerprint", fp);
    }
    return fp;
  }

  async function logUsage(toolType: string, inputSummary: any, outputSummary: any) {
    try {
      const fingerprint = getFingerprint();
      const response = await api.post("/tools/log", {
        tool_type: toolType,
        input_summary: inputSummary,
        output_summary: outputSummary,
        guest_fingerprint: fingerprint
      });
      // Refresh history list
      fetchHistory();
      return response.data;
    } catch (e) {
      console.warn("Failed to log tool activity backend-side:", e);
    }
  }

  async function fetchHistory() {
    loading.value = true;
    try {
      const fingerprint = getFingerprint();
      const response = await api.get(`/tools/history?fingerprint=${fingerprint}`);
      history.value = response.data.data;
    } catch (e) {
      console.error("Failed to load tool history:", e);
    } finally {
      loading.value = false;
    }
  }

  async function clearHistory() {
    try {
      const fingerprint = getFingerprint();
      await api.post("/tools/history/clear", { fingerprint });
      history.value = [];
    } catch (e) {
      console.error("Failed to clear tool logs:", e);
    }
  }

  return {
    history,
    loading,
    logUsage,
    fetchHistory,
    clearHistory
  };
});
