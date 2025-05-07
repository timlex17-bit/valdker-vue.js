<template>
    <div class="min-h-screen bg-gray-100 p-6 font-sans">
      <div class="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 class="text-2xl font-bold mb-4 text-center">🛒 Your Cart</h1>
  
        <div v-if="cart.length === 0" class="text-center text-gray-500">
          Cart is empty.
        </div>
  
        <div v-else>
          <ul class="divide-y divide-gray-200 mb-4">
            <li
              v-for="item in cart"
              :key="item.product.id"
              class="flex justify-between py-2 text-sm"
            >
              <span>{{ item.product.name }} x{{ item.quantity }}</span>
              <span>${{ item.subtotal.toFixed(2) }}</span>
            </li>
          </ul>
  
          <div class="text-right font-semibold text-gray-800 mb-4">
            Total: ${{ total.toFixed(2) }}
          </div>
  
          <button
            class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded w-full mb-2"
            @click="checkout"
          >
            ✅ Checkout
          </button>
  
          <button
            class="text-sm text-gray-600 hover:underline w-full text-center"
            @click="goBack"
          >
            ← Back to Shopping
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['cart', 'total'],
    methods: {
      checkout() {
        alert(`Total pembayaran: $${this.total.toFixed(2)}\nTransaksi berhasil!`);
        this.cart.splice(0); // Kosongkan array cart
        this.$router.push('/');
      },
      goBack() {
        this.$router.push('/');
      }
    }
  };
  </script>
  