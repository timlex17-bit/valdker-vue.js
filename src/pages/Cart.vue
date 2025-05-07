<template>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Keranjang</h1>
  
      <div v-if="cart.length === 0" class="text-gray-500">Cart is empty.</div>
  
      <div v-else>
        <ul>
          <li
            v-for="item in cart"
            :key="item.product.id"
            class="flex items-center gap-3 mb-4"
          >
            <img
              :src="item.product.image"
              alt="Product"
              class="w-12 h-12 object-cover rounded"
            />
            <div class="flex-1">
              <div class="font-semibold">
                {{ item.product.name }} (x{{ item.quantity }})
              </div>
              <div class="text-gray-500 text-sm">
                $ {{ item.subtotal.toFixed(2) }}
              </div>
            </div>
            <button
              @click="removeItem(item.product.id)"
              class="text-red-500 hover:text-red-700 text-lg"
            >
              🗑️
            </button>
          </li>
        </ul>
  
        <div class="mt-4 text-right font-bold">
          Total: $ {{ total.toFixed(2) }}
        </div>
  
        <button
          @click="checkout"
          class="mt-4 bg-green-600 text-white font-semibold px-4 py-2 rounded w-full"
        >
          ✅ Bayar
        </button>
  
        <button
          @click="cartStore.clearCart()"
          class="mt-2 w-full text-red-600 border border-red-400 py-2 rounded hover:bg-red-50"
        >
          ❌ Cancel Order
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useCartStore } from '@/stores/cart'
  import { storeToRefs } from 'pinia'
  
  const cartStore = useCartStore()
  const { items: cart, total } = storeToRefs(cartStore)
  
  function checkout() {
    alert(`Total: $ ${total.value.toFixed(2)}\nTransaksi berhasil!`)
    cartStore.clearCart()
  }
  
  function removeItem(productId) {
    cartStore.items = cartStore.items.filter(item => item.product.id !== productId)
  }
  </script>
  