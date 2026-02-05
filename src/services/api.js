import axios from "axios"

// ✅ fallback aman kalau env tidak kebaca
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://valdker.onrender.com"

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    console.log("TOKEN(localStorage):", token)

    if (token) {
      // ✅ paling kompatibel lintas axios v1
      config.headers = config.headers || {}
      config.headers["Authorization"] = `Token ${token}`

      console.log("AUTH(header set):", config.headers["Authorization"])
    }

    console.log("REQ:", config.method?.toUpperCase(), `${config.baseURL}${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("401 Unauthorized — token invalid/expired OR header not received by backend")
    }
    return Promise.reject(error)
  }
)

export const fetchProducts = () => api.get("/api/products/")
export const fetchCategories = () => api.get("/api/categories/")
export const fetchBanners = () => api.get("/api/banners/")
export const createOrder = (orderData) => api.post("/api/orders/", orderData)

export default api
