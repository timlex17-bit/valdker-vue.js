import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")

    // ✅ DEBUG: cek token kebaca atau tidak
    console.log("TOKEN(localStorage):", token)

    if (token) {
      // ✅ Axios v1 kadang pakai AxiosHeaders object
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Token ${token}`)
      } else {
        config.headers = config.headers || {}
        config.headers["Authorization"] = `Token ${token}`
      }

      // ✅ DEBUG: pastikan Authorization bener-bener ke-set
      const auth =
        (config.headers?.get && config.headers.get("Authorization")) ||
        config.headers?.Authorization ||
        config.headers?.authorization
      console.log("AUTH(header set):", auth)
    }

    console.log("REQ:", config.method?.toUpperCase(), config.baseURL + config.url)
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      console.warn("401 Unauthorized — token invalid/expired OR header not received by backend")
      // jangan langsung hapus token dulu saat debug, biar kita bisa cek
      // localStorage.removeItem("token")
      // localStorage.removeItem("user")
    }

    return Promise.reject(error)
  }
)

export const fetchProducts = () => api.get("/api/products/")
export const fetchCategories = () => api.get("/api/categories/")
export const fetchBanners = () => api.get("/api/banners/")
export const createOrder = (orderData) => api.post("/api/orders/", orderData)

export default api
