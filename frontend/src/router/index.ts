import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    component: () => import("../layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("../pages/LandingPage.vue")
      },
      {
        path: "tools",
        name: "tools",
        component: () => import("../pages/tools/ToolsIndex.vue")
      },
      {
        path: "learning",
        name: "learning",
        component: () => import("../pages/learning/LearningIndex.vue")
      },
      {
        path: "learning/:slug",
        name: "learning-detail",
        component: () => import("../pages/learning/ArticleDetail.vue")
      },
      {
        path: "roadmap",
        name: "roadmap",
        component: () => import("../pages/roadmap/RoadmapGenerator.vue")
      },
      {
        path: "roadmap/:token",
        name: "roadmap-detail",
        component: () => import("../pages/roadmap/RoadmapDetail.vue")
      },
      {
        path: "startup",
        name: "startup",
        component: () => import("../pages/startup/StartupValidator.vue")
      },
      {
        path: "startup/:token",
        name: "startup-detail",
        component: () => import("../pages/startup/StartupDetail.vue")
      },
      {
        path: "playground",
        name: "playground",
        component: () => import("../pages/playground/PlaygroundIndex.vue")
      },
      {
        path: "blog",
        name: "blog",
        component: () => import("../pages/blog/BlogIndex.vue")
      },
      {
        path: "blog/:slug",
        name: "blog-detail",
        component: () => import("../pages/blog/BlogDetail.vue")
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("../pages/dashboard/UserDashboard.vue"),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: "/admin",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        name: "admin-dashboard",
        component: () => import("../pages/admin/Dashboard.vue")
      }
    ]
  },
  {
    path: "/auth",
    component: () => import("../layouts/AuthLayout.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("../pages/auth/Login.vue")
      },
      {
        path: "register",
        name: "register",
        component: () => import("../pages/auth/Register.vue")
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../pages/errors/NotFound.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  
  // Try to resolve auth status on initial load if not populated
  if (!authStore.user && localStorage.getItem("accessToken")) {
    await authStore.checkAuth();
  }

  const isAuth = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;

  if (to.meta.requiresAuth && !isAuth) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
