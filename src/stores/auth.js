import { defineStore } from "pinia"
import api from "@/services/api"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null")
      } catch {
        return null
      }
    })(),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    loadFromStorage() {
      this.token = localStorage.getItem("token") || ""
      try {
        this.user = JSON.parse(localStorage.getItem("user") || "null")
      } catch {
        this.user = null
      }
    },

    async login({ username, password }) {
      // endpoint kamu: /api/auth/login
      const res = await api.post("/api/auth/login", { username, password })

      const token = res?.data?.token
      const user = res?.data?.user

      if (!token || !user) {
        throw new Error("Response login tidak valid (token/user kosong).")
      }

      // ✅ simpan ke state
      this.token = token
      this.user = {
        id: user.id,
        username: user.username,
        full_name: user.full_name || "",
        role: user.role || "",
        is_staff: !!user.is_staff,
        is_superuser: !!user.is_superuser,
      }

      // ✅ simpan ke localStorage (dipakai interceptor axios juga)
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(this.user))

      return this.user
    },

    logout() {
      this.token = ""
      this.user = null
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
  },
})