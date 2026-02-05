import axios from "axios"

// ✅ fallback aman kalau env tidak kebaca
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://valdker.onrender.com"

// ✅ daftar endpoint PUBLIC (tanpa token)
const PUBLIC_ENDPOINTS = [
  "/api/auth/login",   // login
  "/api/auth/register" // kalau ada
]

// helper: cek URL termasuk public endpoint atau tidak
const isPublicEndpoint = (url = "") => {
  // url bisa "/api/auth/login" atau full url
  return PUBLIC_ENDPOINTS.some((p) => url.includes(p))
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const url = config.url || ""
    const full = `${config.baseURL}${url}`

    // ✅ JANGAN kirim token ke endpoint public (login)
    if (isPublicEndpoint(url) || isPublicEndpoint(full)) {
      console.log("PUBLIC REQ (skip auth):", config.method?.toUpperCase(), full)
      return config
    }

    const token = localStorage.getItem("token")
    console.log("TOKEN(localStorage):", token)

    if (token) {
      // ✅ paling kompatibel lintas axios v1
      config.headers = config.headers || {}
      config.headers.Authorization = `Token ${token}`
      console.log("AUTH(header set):", config.headers.Authorization)
    } else {
      console.log("NO TOKEN — request will be unauthenticated")
    }

    console.log("REQ:", config.method?.toUpperCase(), full)
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ""
    const full = `${error?.config?.baseURL || ""}${url}`

    if (status === 401) {
      console.warn("401 Unauthorized:", full)

      // ✅ kalau 401 di endpoint selain login, biasanya token invalid/expired
      // Untuk debug, saya tidak hapus token dulu.
      // Kalau kamu mau otomatis logout, aktifkan block ini:
      /*
      if (!isPublicEndpoint(url) && !isPublicEndpoint(full)) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // optional: redirect ke /login
        // window.location.href = "/login"
      }
      */
    }

    return Promise.reject(error)
  }
)

// ✅ API functions
export const loginApi = (payload) => api.post("/api/auth/login", payload)

export const fetchProducts = () => api.get("/api/products/")
export const fetchCategories = () => api.get("/api/categories/")
export const fetchBanners = () => api.get("/api/banners/")
export const createOrder = (orderData) => api.post("/api/orders/", orderData)

export default api
