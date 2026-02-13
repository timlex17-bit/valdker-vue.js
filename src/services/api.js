import axios from "axios"

const isDev = import.meta.env.DEV

// ✅ kalau tidak set env, default DEV pakai IP LAN server Django, PROD pakai Render
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  console.log("API_BASE =", API_BASE)
  (isDev ? "http://192.168.1.197:8000" : "https://valdker.onrender.com")

const PUBLIC_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
]

const isPublicEndpoint = (url = "") => PUBLIC_ENDPOINTS.some((p) => url.includes(p))

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const url = config.url || ""
  const full = `${config.baseURL || ""}${url}`

  if (isPublicEndpoint(url) || isPublicEndpoint(full)) {
    console.log("PUBLIC REQ (skip auth):", config.method?.toUpperCase(), full)
    return config
  }

  const token = localStorage.getItem("token")
  console.log("TOKEN(localStorage):", token)

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Token ${token}`
    console.log("AUTH(header set):", config.headers.Authorization)
  } else {
    console.log("NO TOKEN — request will be unauthenticated")
  }

  console.log("REQ:", config.method?.toUpperCase(), full)
  return config
})

api.interceptors.response.use(
  (res) => {
    console.log("RES:", res.status, res.config.url, "len:", Array.isArray(res.data) ? res.data.length : "-")
    return res
  },
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ""
    const full = `${error?.config?.baseURL || ""}${url}`
    console.error("ERR:", status, full, error?.response?.data || error.message)
    return Promise.reject(error)
  }
)

// functions
export const loginApi = (payload) => api.post("/api/auth/login", payload)
export const fetchProducts = () => api.get("/api/products/")
export const fetchCategories = () => api.get("/api/categories/")
export const fetchBanners = () => api.get("/api/banners/")
export const createOrder = (orderData) => api.post("/api/orders/", orderData)

export default api
