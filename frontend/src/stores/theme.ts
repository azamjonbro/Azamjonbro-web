import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<"dark" | "light">("dark");

  function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      theme.value = saved;
    } else {
      theme.value = "dark";
    }
    applyTheme();
  }

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme.value);
    applyTheme();
  }

  function applyTheme() {
    const root = document.documentElement;
    if (theme.value === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  return {
    theme,
    initTheme,
    toggleTheme
  };
});
