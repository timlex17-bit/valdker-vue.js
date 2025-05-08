<template>
  <div class="min-h-screen bg-white font-sans">

    <!-- BANNER SLIDER -->
    <div class="h-40 bg-gray-100 relative overflow-hidden">
      <transition name="fade" mode="in-out">
        <img
          v-if="banners.length"
          :key="banners[currentBannerIndex]?.id"
          :src="banners[currentBannerIndex]?.image_url"
          alt="Banner"
          class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        />
      </transition>
      <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 w-[80%]">
        <div
          v-for="(banner, index) in banners"
          :key="index"
          class="h-1 flex-1 rounded bg-white/50 overflow-hidden"
        >
          <div
            v-if="index === currentBannerIndex"
            class="h-full bg-white animate-progress"
          ></div>
        </div>
      </div>
    </div>

    <!-- MAIN SECTION & SIDEBAR -->
    <div class="flex">
      <div class="w-24 h-[calc(100vh-10rem)] overflow-y-auto scroll-smooth bg-white shadow-lg flex flex-col items-center py-6 space-y-6">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="filterByCategory(cat.id)"
          :class="[
            'w-24 h-24 cursor-pointer rounded-xl border flex items-center justify-center p-2 transition hover:border-yellow-400',
            selectedCategory === cat.id ? 'border-yellow-500 bg-yellow-100' : 'border-transparent'
          ]"
        >
        <img :src="cat.icon || '/placeholder.png'" class="w-20 h-20 object-contain" />
        </button>
      </div>

      <!-- CONTENT PRODUTU -->
      <div class="flex-1 p-6">
        <div class="flex justify-between items-center mb-4 relative">
          <h2 class="text-2xl font-bold">Tried & Loved</h2>
          <div class="flex items-center gap-3">
            <div class="relative w-64">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z"/>
              </svg>
              <input 
                type="text"
                v-model="search"
                :placeholder="''"
                class="border rounded-full px-10 py-3 w-full shadow"
              />
              <transition name="slide-fade" mode="out-in">
                <span
                  :key="placeholderText"
                  class="absolute left-10 top-3.5 text-gray-400 text-sm pointer-events-none"
                >
                  {{ placeholderText }}
                </span>
              </transition>
            </div>
            <div class="relative">
              <button
                @click="toggleCart"
                class="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow relative cart-icon"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 3h2l.4 2M7 13h14l1-5H6.4M7 13l-1.35 6.75a1 1 0 00.98 1.25h12.74a1 1 0 00.98-1.25L17 13H7z"/>
                </svg>
                <span
                  v-if="cart.length > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {{ cart.length }}
                </span>
              </button>
            </div>
          </div>
        </div>

       <!-- GRID PRODUTU  -->
        <div v-if="loading.value" class="text-center text-gray-500 my-6">
          🔄 Loading products...
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card border rounded-xl p-4 text-center hover:shadow cursor-pointer"
            @click="showProductDetail(product)"
          >
            <img :src="product.image" alt="" class="w-30 h-28 mx-auto object-contain bg-white p-2 rounded mb-3" />
            <h3 class="font-bold text-base">{{ product.name }}</h3>
            <p class="text-gray-600 font-semibold text-base">{{ formatPrice(product.price) }}</p>

            <!-- Tombol Karosa dengan animasi -->
            <button
              class="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold px-6 py-3 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              @click.stop="(event) => addToCart(product, event)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 5v14m7-7H5" />
              </svg>
              Karosa
            </button>
          </div>
        </div>
       </div>
      </div>
      
      <!-- Animasaun halai ba cart -->
      <div
        v-if="flyToCart"
        :style="{ top: flyTop + 'px', left: flyLeft + 'px' }"
        class="fixed z-50 w-10 h-10 pointer-events-none transition-all duration-700 ease-in-out"
      >
        <img :src="flyImage" class="w-full h-full object-contain rounded-full shadow-lg" />
      </div>

     <!-- PRODUTU DETALLE & MODAL -->
     <div v-if="selectedProduct" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="selectedProduct = null">
      <div class="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative">
        <button class="absolute top-2 right-2 text-gray-600 hover:text-red-600" @click="selectedProduct = null">
          &times;
        </button>
        
        <!-- Imagen Produtu -->
        <img :src="selectedProduct.image" class="w-full h-56 object-contain mb-4 rounded" />
        
        <!-- Divider -->
        <div class="border-t border-gray-300 my-4"></div>
        
        <!-- Produtu Detalle -->
        <h3 class="text-xl font-bold mb-1">{{ selectedProduct.name }}</h3>
        <p class="text-gray-700 mb-2">Presu: {{ formatPrice(selectedProduct.price) }}</p>
        <p class="text-gray-600 text-sm">Deskrisaun: {{ selectedProduct.description || 'La iha deskrisaun' }}</p>
      </div>
    </div>

    <!-- SIDEBAR CART -->
      <CartSidebar :visible="showCart" @close="toggleCart" @checkout="showCheckout = true" />
        </div>
        <Teleport to="body">
        <div v-if="showCheckout" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="showCheckout = false">
          <div class="bg-white rounded-lg p-6 w-full max-w-xl relative shadow-xl">
        <button @click="showCheckout = false" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold">&times;</button>
        <Checkout />
      </div>
    </div>
  </Teleport>

</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchProducts, fetchCategories, fetchBanners } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import CartSidebar from '@/components/CartSidebar.vue'
import Checkout from '@/pages/Checkout.vue'

const flyToCart = ref(false)
const flyImage = ref('')
const flyTop = ref(0)
const flyLeft = ref(0)

const showCheckout = ref(false)

const cartStore = useCartStore()
const { items: cart, total } = storeToRefs(cartStore)

const selectedProduct = ref(null)
const showProductDetail = (product) => {
  selectedProduct.value = product
}

const banners = ref([])
const currentBannerIndex = ref(0)
const search = ref('')
const products = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const loading = ref(true)
const showCart = ref(false)

const placeholderList = ['Nasi Goreng...', 'Boba...', 'Burger...', 'Ayam Crispy...', 'Kafe...', 'Ice Cream...']
const placeholderText = ref(placeholderList[0])
let placeholderIndex = 0

const toggleCart = () => showCart.value = !showCart.value

const addToCart = (product, event) => {
  cartStore.addToCart(product)

  const productCard = event.currentTarget.closest('.product-card')
  const cartIcon = document.querySelector('.cart-icon')?.getBoundingClientRect()
  if (!productCard || !cartIcon) return

  const rect = productCard.getBoundingClientRect()

  flyImage.value = product.image
  flyTop.value = rect.top
  flyLeft.value = rect.left
  flyToCart.value = true

  setTimeout(() => {
    flyTop.value = cartIcon.top
    flyLeft.value = cartIcon.left
  }, 10)

  setTimeout(() => {
    flyToCart.value = false
  }, 800)
}

const filterByCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

const filteredProducts = computed(() =>
  products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase()) &&
    (!selectedCategory.value || p.category_id === selectedCategory.value)
  )
)

const formatPrice = (value) => `$ ${value.toFixed(2)}`

onMounted(async () => {
  setInterval(() => {
    placeholderIndex = (placeholderIndex + 1) % placeholderList.length
    placeholderText.value = placeholderList[placeholderIndex]
  }, 3000)

  try {
    const [productRes, categoryRes, bannerRes] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBanners()
    ])

    products.value = productRes.data.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image_url || '/placeholder.png',
      price: Number(p.sell_price),
      description: p.description || '',
      category_id: p.category?.id || null
    }))

    categories.value = categoryRes.data.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon_url || '/placeholder.png'
    }))

    banners.value = bannerRes.data

    setInterval(() => {
    currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
    }, 10000) 

  } catch (err) {
      console.error('Gagal fetch:', err)
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
body {
  font-family: 'Helvetica Neue', sans-serif;
}

html {
  touch-action: manipulation;
  overscroll-behavior: none;
  user-select: none;
}

@keyframes progressBar {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-progress {
    animation: none;
  }
}

.animate-progress {
  animation: progressBar 10s linear forwards;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
