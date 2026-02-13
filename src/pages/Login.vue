<!-- Login.vue (Production-ready, English UI + comments) -->
<template>
  <div class="min-h-screen bg-gray-50" @contextmenu.prevent>
    <div class="p-4 lg:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <!-- Left: Brand / Info -->
          <section class="bg-white rounded-3xl shadow-sm border p-6 lg:p-8">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full bg-purple-500"></div>
              <div class="text-3xl font-extrabold tracking-tight">valdker</div>
              <div class="text-sm font-bold text-gray-700 mt-2">LAB</div>
            </div>

            <div class="mt-6 border-t"></div>

            <div class="mt-6">
              <h2 class="text-2xl font-extrabold text-gray-900">POS Login</h2>
              <p class="text-gray-500 mt-2 leading-relaxed">
                Sign in to start transactions in tablet/desktop mode.
                This UI follows your POS style: clean, large, and touch-friendly.
              </p>

              <div class="mt-6 grid grid-cols-2 gap-3">
                <div class="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                  <div class="text-xs text-gray-500">Status</div>
                  <div class="mt-1 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span class="font-extrabold text-gray-700">Offline</span>
                  </div>
                </div>

                <div class="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                  <div class="text-xs text-gray-500">Mode</div>
                  <div class="mt-1 font-extrabold text-gray-700">Cashier</div>
                </div>
              </div>

              <div class="mt-6 rounded-2xl border border-gray-100 p-4">
                <div class="text-sm font-extrabold text-gray-800 mb-2">Quick tips</div>
                <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Use a cashier account to access the POS.</li>
                  <li>After a successful login, you will be redirected to the POS.</li>
                  <li>In Electron, the token will be stored in localStorage.</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Right: Login form -->
          <section class="bg-white rounded-3xl shadow-sm border p-6 lg:p-8">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-gray-400">Welcome back</div>
                <div class="text-2xl font-extrabold text-gray-900">Sign in</div>
              </div>

              <div class="h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span class="font-bold text-gray-700">Offline</span>
                <span class="text-gray-400">📶</span>
              </div>
            </div>

            <div class="mt-6 border-t"></div>

            <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
              <div>
                <label class="text-sm font-extrabold text-gray-700">Username</label>
                <div class="relative mt-2">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    ref="usernameRef"
                    v-model.trim="form.username"
                    class="w-full h-12 rounded-2xl bg-gray-50 border border-gray-100 pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="e.g. jeremiass"
                    autocomplete="username"
                    inputmode="text"
                    :disabled="loading"
                    @keydown.enter.prevent="onSubmit"
                  />
                </div>
              </div>

              <div>
                <label class="text-sm font-extrabold text-gray-700">Password</label>
                <div class="relative mt-2">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    v-model="form.password"
                    :type="showPass ? 'text' : 'password'"
                    class="w-full h-12 rounded-2xl bg-gray-50 border border-gray-100 pl-11 pr-12 text-base outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    :disabled="loading"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                    @click="showPass = !showPass"
                    :title="showPass ? 'Hide password' : 'Show password'"
                    :disabled="loading"
                  >
                    {{ showPass ? "🙈" : "👁️" }}
                  </button>
                </div>
              </div>

              <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {{ error }}
              </div>

              <button
                class="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold disabled:opacity-50"
                :disabled="loading || !canSubmit"
              >
                <span v-if="!loading">Sign in</span>
                <span v-else>🔄 Signing in...</span>
              </button>

              <!-- Demo button (kept, but clearly marked). You can remove for production if desired. -->
              <button
                type="button"
                class="w-full h-12 rounded-2xl border border-gray-200 hover:bg-gray-50 font-extrabold"
                @click="fillDemo"
                :disabled="loading"
              >
                Fill demo credentials
              </button>

              <div class="pt-3 border-t text-sm text-gray-500">
                After a successful login, you will be redirected to:
                <span class="font-extrabold text-gray-700">/tablet</span>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const usernameRef = ref(null)

const form = ref({
  username: "",
  password: "",
})

const showPass = ref(false)
const loading = ref(false)
const error = ref("")

/**
 * Basic client-side validation to avoid empty submissions.
 * Server-side validation must still be enforced in the backend.
 */
const canSubmit = computed(() => {
  return Boolean(form.value.username?.trim()) && Boolean(form.value.password)
})

onMounted(() => {
  // Load persisted auth state (token/user) from storage.
  auth.loadFromStorage()

  // If already logged in, go directly to POS.
  if (auth.isLoggedIn) {
    router.replace("/tablet")
    return
  }

  // Autofocus username for faster cashier workflow.
  usernameRef.value?.focus()
})

/**
 * Demo helper (optional). Remove in strict production environments.
 */
const fillDemo = () => {
  form.value.username = "admin"
  form.value.password = "admin"
  error.value = ""
}

/**
 * Signs in using the auth store, then redirects to:
 * - route.query.next (if provided)
 * - /tablet (default)
 */
const onSubmit = async () => {
  if (loading.value) return
  if (!canSubmit.value) {
    error.value = "Please enter your username and password."
    return
  }

  error.value = ""
  loading.value = true

  try {
    // Auth store should handle saving token/user internally if implemented.
    const res = await auth.login({
      username: form.value.username.trim(),
      password: form.value.password,
    })

    // Safety net: persist token/user if the store does not do it yet.
    // Supports common response shapes: {token} / {auth_token} / {data:{token}} / {data:{auth_token}}
    const token =
      res?.token ||
      res?.data?.token ||
      res?.auth_token ||
      res?.data?.auth_token ||
      ""

    if (token) {
      localStorage.setItem("token", token)
      const user = res?.user || res?.data?.user || {}
      localStorage.setItem("user", JSON.stringify(user))
      auth.loadFromStorage()
    }

    const next = route.query?.next ? String(route.query.next) : "/tablet"
    router.replace(next)
  } catch (e) {
    // Prefer backend message if available, fall back to a safe generic message.
    const msg =
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "Login failed. Please check your credentials."
    error.value = msg
  } finally {
    loading.value = false
  }
}
</script>
