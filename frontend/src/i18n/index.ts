import { createI18n } from "vue-i18n";

const messages = {
  en: {
    nav: {
      home: "Home",
      tools: "Tools",
      learning: "Learning",
      roadmap: "AI Roadmap",
      startup: "Startup Validator",
      playground: "Cyber Playground",
      blog: "Blog",
      dashboard: "Dashboard",
      admin: "Admin Portal",
      login: "Sign In",
      register: "Get Started",
      logout: "Log Out"
    },
    hero: {
      title: "Build. Learn. Grow.",
      subtitle: "Developer tools, learning resources, AI roadmaps, startup validation, and cybersecurity labs in one premium platform.",
      ctaStart: "Start Exploring",
      ctaTools: "Open Tools",
      ctaRoadmap: "Generate Roadmap"
    },
    common: {
      copy: "Copy",
      copied: "Copied!",
      save: "Save",
      saved: "Saved!",
      share: "Share",
      loading: "Processing...",
      history: "History",
      theme: "Theme",
      language: "Language"
    }
  },
  uz: {
    nav: {
      home: "Bosh sahifa",
      tools: "Uskunalar",
      learning: "Ta'lim",
      roadmap: "AI Yo'l xaritasi",
      startup: "Startap Validatsiya",
      playground: "Kiber Maydoncha",
      blog: "Blog",
      dashboard: "Boshqaruv",
      admin: "Admin Panel",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      logout: "Chiqish"
    },
    hero: {
      title: "Yarating. O'rganing. O'sing.",
      subtitle: "Dasturchi uskunalari, ta'lim resurslari, AI yo'l xaritalari, startap g'oyalar tahlili va kiberxavfsizlik laboratoriyalari yagona premium platformada.",
      ctaStart: "Tanishish",
      ctaTools: "Uskunalar",
      ctaRoadmap: "Yo'l xaritasini yaratish"
    },
    common: {
      copy: "Nusxalash",
      copied: "Nusxalandi!",
      save: "Saqlash",
      saved: "Saqlandi!",
      share: "Ulashish",
      loading: "Yuklanmoqda...",
      history: "Tarix",
      theme: "Mavzu",
      language: "Til"
    }
  },
  ru: {
    nav: {
      home: "Главная",
      tools: "Инструменты",
      learning: "Обучение",
      roadmap: "ИИ Дорожная карта",
      startup: "Валидатор стартапов",
      playground: "Кибер-полигон",
      blog: "Блог",
      dashboard: "Кабинет",
      admin: "Админ-панель",
      login: "Войти",
      register: "Регистрация",
      logout: "Выйти"
    },
    hero: {
      title: "Создавай. Учись. Расти.",
      subtitle: "Инструменты разработчика, учебные ресурсы, ИИ-дорожные карты, валидация стартапов и лаборатории кибербезопасности на одной премиум-платформе.",
      ctaStart: "Начать обзор",
      ctaTools: "Инструменты",
      ctaRoadmap: "Создать карту"
    },
    common: {
      copy: "Копировать",
      copied: "Скопировано!",
      save: "Сохранить",
      saved: "Сохранено!",
      share: "Поделиться",
      loading: "Загрузка...",
      history: "История",
      theme: "Тема",
      language: "Язык"
    }
  }
};

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem("preferred_language") || "en",
  fallbackLocale: "en",
  messages
});

export default i18n;
