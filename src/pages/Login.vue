<template>
  <div class="min-h-screen bg-gray-50" @contextmenu.prevent>
    <div class="p-4 lg:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- WRAP -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <!-- LEFT: BRAND PANEL -->
          <section class="bg-white rounded-3xl shadow-sm border p-6 lg:p-8">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full bg-purple-500"></div>
              <div class="text-3xl font-extrabold tracking-tight">valdker</div>
              <div class="text-sm font-bold text-gray-700 mt-2">LAB</div>
            </div>

            <div class="mt-6 border-t"></div>

            <div class="mt-6">
              <h2 class="text-2xl font-extrabold text-gray-900">
                POS Login
              </h2>
              <p class="text-gray-500 mt-2 leading-relaxed">
                Login dulu untuk mulai transaksi di mode tablet/desktop.
                UI ini dibuat mengikuti style POS kamu (clean, besar, touch-friendly).
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
                  <div class="mt-1 font-extrabold text-gray-700">Kasir</div>
                </div>
              </div>

              <div class="mt-6 rounded-2xl border border-gray-100 p-4">
                <div class="text-sm font-extrabold text-gray-800 mb-2">Tips cepat</div>
                <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Gunakan akun kasir untuk akses POS.</li>
                  <li>Sesudah login → otomatis masuk ke halaman POS.</li>
                  <li>Di Electron, token akan tersimpan di localStorage.</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- RIGHT: LOGIN FORM -->
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
                    v-model="form.username"
                    class="w-full h-12 rounded-2xl bg-gray-50 border border-gray-100 pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="contoh: jeremiass"
                    autocomplete="username"
                    inputmode="text"
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
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                    @click="showPass = !showPass"
                    :title="showPass ? 'Hide' : 'Show'"
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
                :disabled="loading"
              >
                <span v-if="!loading">Login</span>
                <span v-else>🔄 Logging in...</span>
              </button>

              <button
                type="button"
                class="w-full h-12 rounded-2xl border border-gray-200 hover:bg-gray-50 font-extrabold"
                @click="fillDemo"
                :disabled="loading"
              >
                Isi contoh (demo)
              </button>

              <div class="pt-3 border-t text-sm text-gray-500">
                Setelah login sukses, kamu akan diarahkan ke:
                <span class="font-extrabold text-gray-700">/pos</span>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
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

onMounted(() => {
  auth.loadFromStorage()

  if (auth.isLoggedIn) {
    router.replace("/pos")
    return
  }

  usernameRef.value?.focus()
})

const fillDemo = () => {
  form.value.username = "Jeremiass"
  form.value.password = "1234"
  error.value = ""
}

const onSubmit = async () => {
  error.value = ""
  loading.value = true
  try {
    await auth.login({
      username: form.value.username,
      password: form.value.password,
    })

    const next = route.query?.next ? String(route.query.next) : "/pos"
    router.replace(next)
  } catch (e) {
    error.value = e?.message || "Login gagal."
  } finally {
    loading.value = false
  }
}
</script>
