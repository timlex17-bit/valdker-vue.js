<template>
  <div
    class="min-h-screen bg-gray-50"
    @contextmenu.prevent
    @dragstart.prevent
    @selectstart.prevent
    @gesturestart.prevent
  >
    <!-- MAIN WRAP -->
    <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6">
      <!-- LEFT SIDEBAR (✅ DISHIDE DI ANDROID / MOBILE) -->
      <aside class="hidden w-full lg:w-[280px] shrink-0">
        <div
          class="bg-white rounded-3xl shadow-sm border p-4 lg:p-6
                 h-auto lg:h-[calc(100vh-3rem)] flex flex-col"
        >
          <!-- Brand -->
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-purple-500"></div>
            <div class="text-3xl font-extrabold tracking-tight">valdker</div>
            <div class="text-sm font-bold text-gray-700 mt-2">LAB</div>
          </div>

          <div class="my-4 lg:my-6 border-t"></div>

          <div class="text-sm font-bold text-gray-400 mb-3 lg:mb-4">Menu</div>

          <!-- ✅ Categories DIHILANGKAN -->
          <div class="text-sm text-gray-500">
            Kategoria iha Android (Hybrid).
          </div>

          <div class="my-4 lg:my-6 border-t hidden lg:block"></div>

          <!-- Manage (desktop only) -->
          <div class="hidden lg:block">
            <div class="text-sm font-bold text-gray-400 mb-3">Manage</div>
            <button
              class="w-full h-14 rounded-2xl border border-gray-200 flex items-center gap-4 px-4 hover:border-gray-300 transition"
            >
              <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">⚙️</div>
              <div class="font-bold">Settings</div>
            </button>
          </div>
        </div>
      </aside>

      <!-- CONTENT -->
      <main class="flex-1 min-w-0">
        <div
          class="bg-white rounded-3xl shadow-sm border p-4 lg:p-6
                h-auto lg:h-[calc(100vh-3rem)] flex flex-col"
        >
          <!-- TOP BAR (✅ DIHILANGKAN) -->
          <div class="hidden flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <!-- Search -->
            <div class="flex-1">
              <div class="relative w-full sm:max-w-[520px]">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">⌕</span>
                <input
                  ref="barcodeRef"
                  v-model="search"
                  @keydown.enter.prevent="onEnterSearch"
                  type="text"
                  placeholder="Search"
                  class="w-full h-12 rounded-2xl bg-gray-50 border border-gray-100 pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-orange-400"
                  inputmode="search"
                  autocomplete="off"
                />
              </div>
            </div>

            <!-- Right controls -->
            <div class="flex items-center gap-3 justify-between sm:justify-end">
              <!-- Offline pill -->
              <div class="h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span class="font-bold text-gray-700">Offline</span>
                <span class="text-gray-400">📶</span>
              </div>

              <!-- Cart -->
              <button
                class="relative h-12 w-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition cart-icon"
                @click="openCartDrawer"
                title="Cart"
              >
                🛒
                <span
                  v-if="cartCount > 0"
                  class="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-orange-500 text-white text-xs font-extrabold flex items-center justify-center"
                >
                  {{ cartCount }}
                </span>
              </button>

              <!-- ✅ Profile + Dropdown -->
              <div class="relative" ref="profileWrapRef">
                <button
                  type="button"
                  class="h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 hover:bg-gray-100 transition"
                  @click="toggleProfileMenu"
                >
                  <div class="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center">👤</div>
                  <div class="leading-tight hidden sm:block text-left">
                    <div class="font-extrabold text-sm">{{ displayName }}</div>
                    <div class="text-xs text-gray-500">Loja</div>
                  </div>
                  <div class="text-gray-400 text-sm ml-1">▾</div>
                </button>

                <!-- Dropdown -->
                <Transition name="fade">
                  <div
                    v-if="showProfileMenu"
                    class="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div class="p-3 border-b bg-gray-50">
                      <div class="text-xs text-gray-500">Signed in as</div>
                      <div class="font-extrabold text-gray-800 truncate">{{ displayName }}</div>
                      <div class="text-xs text-gray-500 truncate">{{ displayRole }}</div>
                    </div>

                    <button
                      class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                      @click="goChangePassword"
                    >
                      <span>🔑</span>
                      <span class="font-bold text-gray-700">Change Password</span>
                    </button>

                    <button
                      class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                      @click="goPrivacyPolicy"
                    >
                      <span>🛡️</span>
                      <span class="font-bold text-gray-700">Privacy Policy</span>
                    </button>

                    <div class="border-t"></div>

                    <button
                      class="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3"
                      @click="doLogout"
                    >
                      <span>🚪</span>
                      <span class="font-extrabold text-red-600">Log Out</span>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <div class="mt-4 lg:mt-6 border-t hidden"></div>

          <!-- Header row -->
          <div class="flex items-center justify-between mt-4 lg:mt-6 mb-3 lg:mb-4">
            <div class="text-xl lg:text-2xl font-extrabold">{{ placeholderText }}</div>
            <div class="text-sm text-gray-500">{{ filteredProducts.length }} items</div>
          </div>

          <!-- Body -->
          <div class="flex-1 min-h-0">
            <div v-if="loading" class="text-center text-gray-500 py-10">
              🔄 Loading products...
            </div>

            <div v-else class="grid gap-4 sm:gap-6 overflow-y-auto pr-1 lg:pr-2" :class="gridClass">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow transition cursor-pointer select-none product-card"
                @click="showProductDetail(product)"
              >
                <div class="p-4">
                  <div class="bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
                    <img
                      :src="product.image"
                      alt=""
                      class="w-full h-40 sm:h-44 md:h-48 object-contain p-3"
                      draggable="false"
                    />
                  </div>

                  <div class="mt-4">
                    <div class="font-extrabold text-base line-clamp-1">{{ product.name }}</div>
                    <div class="text-xs text-gray-400 mt-1">Low Stock</div>
                  </div>

                  <div class="mt-4 flex items-center justify-between gap-3">
                    <div class="text-xl sm:text-2xl font-extrabold whitespace-nowrap">
                      {{ formatPrice(product.price) }}
                    </div>

                    <button
                      class="h-10 px-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm active:scale-[0.99] shrink-0"
                      @click.stop="(event) => addToCart(product, event)"
                    >
                      ＋ Karosa
                    </button>
                  </div>
                </div>
              </div>
              <!-- end card -->
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ✅ CART DRAWER (slide) -->
    <!-- ✅ CART DRAWER (slide) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCartDrawer" class="fixed inset-0 z-[60]">
          <!-- ✅ Background overlay HARUS bisa di-klik untuk close -->
          <button
            type="button"
            class="absolute inset-0 bg-black/40"
            @click="closeCartDrawer"
            aria-label="Close cart"
          ></button>

          <Transition name="slide-right">
            <aside
              v-if="showCartDrawer"
              class="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl border-l flex flex-col"
              style="padding-bottom: env(safe-area-inset-bottom);"
            >
              <div class="p-4 border-b flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold">Cart</div>
                  <div class="text-xs text-gray-500">{{ cartCount }} items</div>
                </div>

                <!-- ✅ Close button pasti bisa -->
                <button
                  class="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 text-2xl leading-none font-extrabold"
                  @click="closeCartDrawer"
                  title="Close"
                >
                  ×
                </button>
              </div>

              <div class="flex-1 min-h-0 overflow-y-auto p-4">
                <div v-if="cartItems.length === 0" class="text-sm text-gray-500 py-10 text-center">
                  Karosa Mamuk...
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="item in cartItems"
                    :key="item.id"
                    class="flex items-center gap-3 p-3 rounded-2xl border border-gray-100"
                  >
                    <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        :src="item.image || '/placeholder.png'"
                        class="w-full h-full object-contain p-2"
                        draggable="false"
                      />
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="font-extrabold text-sm truncate">{{ item.name }}</div>
                      <div class="text-xs text-gray-500 mt-0.5">{{ formatPrice(item.price) }}</div>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        class="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 font-extrabold"
                        @click="decreaseQty(item.id)"
                      >
                        −
                      </button>
                      <div class="w-9 text-center font-extrabold">{{ item.qty }}</div>
                      <button
                        class="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 font-extrabold"
                        @click="increaseQty(item.id)"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ✅ Footer pasti kelihatan (kasih pb ekstra untuk Android bottom bar) -->
              <div class="p-4 border-t space-y-3 pb-24">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-extrabold">{{ formatPrice(totalValue) }}</span>
                </div>

                <button
                  class="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold disabled:opacity-40"
                  :disabled="cartCount === 0"
                  @click="continuePayment"
                >
                  Kontinua Pagamentu
                </button>

                <!-- ✅ Ini yang kamu bilang hilang -->
                <button
                  class="w-full h-12 rounded-2xl border border-gray-200 hover:bg-gray-50 font-extrabold disabled:opacity-40"
                  :disabled="cartCount === 0"
                  @click="cancelOrder"
                >
                  Kansela Order
                </button>
              </div>
            </aside>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Fly to cart animation -->
    <div
      v-if="flyToCart"
      :style="{ top: flyTop + 'px', left: flyLeft + 'px' }"
      class="fixed z-50 w-10 h-10 pointer-events-none transition-all duration-700 ease-in-out"
    >
      <img :src="flyImage" class="w-full h-full object-contain rounded-full shadow-lg" draggable="false" />
    </div>

    <!-- Product detail modal -->
      <div
        v-if="selectedProduct"
        class="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
        @click.self="selectedProduct = null"
      >
        <div class="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full relative">
          <button
            class="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-4xl font-extrabold"
            @click="selectedProduct = null"
          >
            &times;
          </button>

          <img :src="selectedProduct.image" class="w-full h-56 object-contain mb-4 rounded-xl" draggable="false" />
          <div class="border-t border-gray-200 my-4"></div>

          <div class="flex justify-between items-center mb-4 gap-3">
            <h3 class="text-2xl font-extrabold flex-1">{{ selectedProduct.name }}</h3>
            <button
              @click.stop="addToCart(selectedProduct, $event)"
              class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-lg font-extrabold flex items-center gap-2 shrink-0"
            >
              ＋ Karosa
            </button>
          </div>

          <p class="text-gray-700 text-lg mb-2">Presu: {{ formatPrice(selectedProduct.price) }}</p>
          <p class="text-gray-600 text-lg">Deskrisaun: {{ selectedProduct.description || "La iha deskrisaun" }}</p>
        </div>
      </div>

    <!-- Checkout modal -->
    <Teleport to="body">
      <div
        v-if="showCheckout"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        @click.self="showCheckout = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-xl relative shadow-xl">
          <button
            @click="showCheckout = false"
            class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-extrabold"
          >
            &times;
          </button>
          <Checkout @success="onCheckoutSuccess" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"
import { useRouter } from "vue-router"
import { fetchProducts } from "@/services/api"
import { useCartStore } from "@/stores/cart"
import { storeToRefs } from "pinia"
import Checkout from "@/pages/Checkout.vue"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const auth = useAuthStore()

const cartStore = useCartStore()
const { items: cart, total } = storeToRefs(cartStore)

const products = ref([])
const loading = ref(true)

const selectedProduct = ref(null)
const showCheckout = ref(false)
const showCartDrawer = ref(false)

const search = ref("")
const barcodeRef = ref(null)
const selectedCategory = ref("all")

const flyToCart = ref(false)
const flyImage = ref("")
const flyTop = ref(0)
const flyLeft = ref(0)

const placeholderList = ["Tried & Loved", "Top Picks", "Most Loved", "Popular Choices", "Today’s Specials", "Delicious Picks"]
const placeholderText = ref(placeholderList[0])
let placeholderIndex = 0
let titleInterval = null

// ✅ profile dropdown
const showProfileMenu = ref(false)
const profileWrapRef = ref(null)

const displayName = computed(() => auth.user?.username || "User")
const displayRole = computed(() => auth.user?.role || "cashier")

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}
const closeProfileMenu = () => {
  showProfileMenu.value = false
}

const goChangePassword = () => {
  closeProfileMenu()
  alert("Change Password (coming soon)")
}
const goPrivacyPolicy = () => {
  closeProfileMenu()
  alert("Privacy Policy (coming soon)")
}
const doLogout = () => {
  closeProfileMenu()
  auth.logout()
  router.replace("/login")
}

// ✅ close dropdown kalau klik di luar
const onDocClick = (e) => {
  const wrap = profileWrapRef.value
  if (!wrap) return
  if (!wrap.contains(e.target)) closeProfileMenu()
}

// Normalize cart items
const cartItems = computed(() => {
  const raw = Array.isArray(cart.value) ? cart.value : []
  return raw
    .map((it) => {
      if (it && (it.name || it.qty || it.image)) {
        return {
          id: it.id ?? it.product_id ?? it.product?.id,
          name: it.name ?? it.product?.name ?? "-",
          image: it.image ?? it.product?.image ?? it.product?.image_url ?? "/placeholder.png",
          price: Number(it.price ?? it.product?.price ?? it.product?.sell_price ?? 0),
          qty: Number(it.qty ?? it.quantity ?? 1),
        }
      }
      return {
        id: it?.product?.id,
        name: it?.product?.name ?? "-",
        image: it?.product?.image ?? it?.product?.image_url ?? "/placeholder.png",
        price: Number(it?.product?.price ?? it?.product?.sell_price ?? 0),
        qty: Number(it?.quantity ?? 1),
      }
    })
    .filter((x) => x.id != null)
})

const cartCount = computed(() => cartItems.value.reduce((sum, it) => sum + (it.qty || 1), 0))
const totalValue = computed(() => Number(total.value || 0))
const gridClass = computed(() => "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5")

const focusBarcode = () => barcodeRef.value?.focus()
const onEnterSearch = () => focusBarcode()

function onCheckoutSuccess() {
  showCheckout.value = false
  showCartDrawer.value = false
  focusBarcode()
}

const openCartDrawer = () => (showCartDrawer.value = true)
const closeCartDrawer = () => (showCartDrawer.value = false)

const continuePayment = () => {
  showCartDrawer.value = false
  showCheckout.value = true
}

const cancelOrder = () => {
  cartStore.clearCart?.()
  showCartDrawer.value = false
  focusBarcode()
}

const increaseQty = (id) => {
  if (typeof cartStore.increaseQty === "function") return cartStore.increaseQty(id)
  const item = cartItems.value.find((i) => i.id === id)
  if (item && typeof cartStore.addToCart === "function") {
    cartStore.addToCart({ id: item.id, name: item.name, image: item.image, price: item.price })
  }
}

const decreaseQty = (id) => {
  if (typeof cartStore.decreaseQty === "function") return cartStore.decreaseQty(id)
  const raw = Array.isArray(cart.value) ? cart.value : []
  const idx = raw.findIndex((it) => (it.id ?? it.product?.id) === id)
  if (idx >= 0) {
    const it = raw[idx]
    if (it.qty != null) it.qty = Math.max(1, Number(it.qty) - 1)
    else if (it.quantity != null) it.quantity = Math.max(1, Number(it.quantity) - 1)
  }
}

const filteredProducts = computed(() =>
  products.value.filter((p) => {
    const q = search.value.trim().toLowerCase()

    const nameOk =
      !q || (p.name || "").toLowerCase().includes(q)

    const categoryOk =
      selectedCategory.value === "all" ||
      String(p.category_id) === String(selectedCategory.value)

    return nameOk && categoryOk
  })
)


const formatPrice = (value) => `$ ${Number(value || 0).toFixed(2)}`
const showProductDetail = (product) => (selectedProduct.value = product)

// ===============================
// ✅ HYBRID: Android -> Vue hooks
// ===============================

// dipanggil dari Android (btnCart)
window.__openCart = () => {
  showCartDrawer.value = true
}

window.__filterCategory = (id) => {
  selectedCategory.value = String(id || "all")
  search.value = ""
  console.log("[__filterCategory]", selectedCategory.value)
}

// dipanggil dari Android (btnUser)
window.__openUserMenu = () => {
  showProfileMenu.value = true
}

// Android kirim kategori: native:category
const onNativeCategory = (e) => {
  const id = String(e?.detail ?? "all")

  // ✅ SET STATE KATEGORI
  selectedCategory.value = id

  // reset search biar konsisten
  search.value = ""

  console.log("[ANDROID CATEGORY]", id)

  focusBarcode()
}

// ===============================
// ✅ Vue -> Android: kirim badge count
// ===============================
const sendCartCountToAndroid = () => {
  try {
    const count = Number(cartCount.value || 0)
    if (window.AndroidBridge && typeof window.AndroidBridge.setCartCount === "function") {
      window.AndroidBridge.setCartCount(count)
    }
  } catch (e) {
    // ignore
  }
}

const addToCart = (product, event) => {
  cartStore.addToCart(product)

  // ✅ update badge Android setiap add
  sendCartCountToAndroid()

  const sourceElement = event?.currentTarget?.closest?.(".product-card") || event?.currentTarget
  const cartIcon = document.querySelector(".cart-icon")?.getBoundingClientRect()
  if (!sourceElement || !cartIcon) return

  const rect = sourceElement.getBoundingClientRect()
  flyImage.value = product.image
  flyTop.value = rect.top
  flyLeft.value = rect.left
  flyToCart.value = true

  setTimeout(() => {
    flyTop.value = cartIcon.top
    flyLeft.value = cartIcon.left
  }, 10)

  setTimeout(() => (flyToCart.value = false), 800)
}

onMounted(async () => {
  auth.loadFromStorage()
  document.addEventListener("click", onDocClick, true)

  // ✅ dengarkan event kategori dari Android
  window.addEventListener("native:category", onNativeCategory)

  const token = localStorage.getItem("token")
  if (!token) {
    router.replace({ path: "/login", query: { next: "/tablet" } })
    loading.value = false
    return
  }

  focusBarcode()

  titleInterval = setInterval(() => {
    placeholderIndex = (placeholderIndex + 1) % placeholderList.length
    placeholderText.value = placeholderList[placeholderIndex]
  }, 6000)

  // ✅ kirim badge awal
  sendCartCountToAndroid()

  // ✅ kirim badge setiap cart berubah (qty + add/remove)
  watch(
    () => cartItems.value.map((i) => `${i.id}:${i.qty}`).join("|"),
    () => sendCartCountToAndroid()
  )

  try {
    const productRes = await fetchProducts()

    products.value = productRes.data.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image_url || "/placeholder.png",
      price: Number(p.sell_price),
      description: p.description || "",
      category_id: p.category?.id ?? p.category_id ?? null, // ✅ WAJIB
    }))
  } catch (err) {
    console.error("Gagal fetch:", err)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (titleInterval) clearInterval(titleInterval)
  document.removeEventListener("click", onDocClick, true)
  window.removeEventListener("native:category", onNativeCategory)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.22s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
