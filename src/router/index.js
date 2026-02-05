import { createRouter, createWebHistory } from "vue-router"

import Home from "../pages/Home.vue"
import Cart from "../pages/Cart.vue"
import Checkout from "../pages/Checkout.vue"
import Login from "../pages/Login.vue"

// lazy load
const PosTablet = () => import("../pages/PosTablet.vue")

// ✅ auth store
import { useAuthStore } from "@/stores/auth"

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { public: true },
  },

  // (opsional) kamu bisa protect juga kalau mau
  {
    path: "/",
    name: "home",
    component: Home,
    meta: { requiresAuth: true },
  },

  {
    path: "/pos",
    name: "pos-tablet",
    component: PosTablet,
    meta: { requiresAuth: true },
  },

  {
    path: "/cart",
    name: "cart",
    component: Cart,
    meta: { requiresAuth: true },
  },

  {
    path: "/checkout",
    name: "checkout",
    component: Checkout,
    meta: { requiresAuth: true },
  },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * ✅ ROUTE GUARD
 * - kalau butuh login dan belum login → redirect /login?next=/target
 */
router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.loadFromStorage()

  const isPublic = !!to.meta?.public
  const needsAuth = !!to.meta?.requiresAuth

  if (isPublic) return true
  if (needsAuth && !auth.isLoggedIn) {
    return {
      path: "/login",
      query: { next: to.fullPath },
    }
  }

  // kalau sudah login lalu buka /login → langsung ke /pos
  if (to.path === "/login" && auth.isLoggedIn) {
    return "/pos"
  }

  return true
})

export default router