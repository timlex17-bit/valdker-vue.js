<template>
    <transition name="slide">
      <div
        v-if="visible"
        class="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-2xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-bold">🛒 Karosa Kompra</h2>
          <button @click="close" class="text-gray-500 hover:text-black text-2xl">&times;</button>
        </div>
  
        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="cart.length === 0" class="text-center text-gray-400 mt-20">
            Karosa Mamuk...
          </div>
  
          <ul v-else class="space-y-4">
            <li
              v-for="item in cart"
              :key="item.product.id"
              class="flex items-center gap-4"
            >
              <img
                :src="item.product.image"
                alt="Product"
                class="w-16 h-16 object-cover rounded"
              />
  
              <div class="flex-1">
                <div class="font-medium text-sm">{{ item.product.name }}</div>
                <div class="text-gray-500 text-xs mb-1">
                  $ {{ item.subtotal.toFixed(2) }}
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="decrease(item.product.id)"
                    class="px-2 bg-gray-200 hover:bg-gray-300 rounded"
                  >–</button>
                  <span class="min-w-[24px] text-center">{{ item.quantity }}</span>
                  <button
                    @click="increase(item.product.id)"
                    class="px-2 bg-gray-200 hover:bg-gray-300 rounded"
                  >+</button>
                </div>
              </div>
  
              <button
                @click="removeItem(item.product.id)"
                class="text-red-500 hover:text-red-700"
              >🗑️</button>
            </li>
          </ul>
        </div>
  
        <!-- Button Pagamentu & Kansela Order -->
        <div class="p-4 border-t">
          <div class="flex justify-between font-semibold text-lg mb-3">
            <span>Total:</span>
            <span>$ {{ total.toFixed(2) }}</span>
          </div>

          <!-- Tombol Pagamentu -->
          <button
            @click="$emit('checkout')"
            :disabled="total === 0"
            class="w-full py-3 rounded font-bold mb-3 transition
              text-white
              bg-green-600 hover:bg-green-700
              disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ✅ Pagamentu
          </button>

          <!-- Tombol Kansela -->
          <button
            @click="cartStore.clearCart()"
            class="w-full text-red-600 border border-red-400 py-2 rounded hover:bg-red-50"
          >
            ❌ Kansela Order
          </button>
        </div>
      </div>
    </transition>

  </template>
  
  <script setup>
    import { useCartStore } from '@/stores/cart'
    import { storeToRefs } from 'pinia'
    import { useRouter } from 'vue-router'

    const emit = defineEmits(['close'])
    const router = useRouter()

    const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
    })

    const cartStore = useCartStore()
    const { items: cart, total } = storeToRefs(cartStore)

    function close() {
    emit('close')
    }

    function removeItem(productId) {
    cartStore.items = cartStore.items.filter(item => item.product.id !== productId)
    }

    function increase(productId) {
    const item = cartStore.items.find(i => i.product.id === productId)
    if (item) {
        item.quantity++
        item.subtotal = item.quantity * item.product.price
    }
    }

    function decrease(productId) {
    const item = cartStore.items.find(i => i.product.id === productId)
    if (item && item.quantity > 1) {
        item.quantity--
        item.subtotal = item.quantity * item.product.price
    } else if (item && item.quantity === 1) {
        removeItem(productId)
     }
    }

    function goToCheckout() {
    emit('close') // tutup sidebar
    router.push('/checkout')
    }
   </script>
  
  <style scoped>
  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-enter-from {
    transform: translateX(100%);
  }
  .slide-leave-to {
    transform: translateX(100%);
  }
  </style>
  