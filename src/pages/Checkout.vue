<template>
    <div class="max-w-xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">🧾 Checkout</h1>
  
      <!-- Pilih Metode -->
      <div class="mb-4">
        <label class="font-medium text-gray-700 mb-2 block">Metode Pagamentu:</label>
        <select v-model="payment" class="w-full border rounded px-4 py-2">
          <option value="cash">💵 Cash - (Selu Iha Kasir) </option>
          <option value="qris">📱 QRIS MOSAN- (Scan / Uza Aplikasaun Mosan)</option>
          <option value="bnctl">🏦 Transferensia - BNCTL</option>
          <option value="mandiri">🏦 Transferensia - Mandiri</option>
          <option value="bnu">🏦 Transferensia - BNU</option>
        </select>
      </div>
  
      <!-- Total -->
      <div class="mb-6">
        <label class="font-medium text-gray-700 block">Total Pagamentu:</label>
        <div class="text-xl font-bold mt-1">$ {{ total.toFixed(2) }}</div>
      </div>
  
      <!-- QRIS QR Code -->
      <div v-if="payment === 'qris'" class="mb-6 text-center">
        <h3 class="font-semibold mb-2">📱 SCAN QRIS MOSAN</h3>
        <img src="/qris.png" alt="QRIS" class="w-48 mx-auto border rounded shadow" />
      </div>
  
      <!-- Upload Bukti Transfer -->
      <div v-if="['bnctl', 'mandiri', 'bnu'].includes(payment)" class="mb-6">
        <label class="block font-medium text-gray-700 mb-2">🖼️ Upload Prova Transferensia</label>
        <input type="file" @change="handleUpload" accept="image/*" class="w-full border rounded px-3 py-2" />
        <p v-if="previewImage" class="mt-2 text-sm text-gray-600">✅ Prova upload ona ho susesu</p>
      </div>
  
      <!-- Tombol Submit -->
      <button
        @click="submitCheckout"
        class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
      >
        ✅ Kontinua Pagamentu
      </button>
    </div>
  </template>
  
  <script setup>
  import { useCartStore } from '@/stores/cart'
  import { storeToRefs } from 'pinia'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const cartStore = useCartStore()
  const { total } = storeToRefs(cartStore)
  const router = useRouter()
  
  const payment = ref('cash')
  const previewImage = ref(null)
  
  function handleUpload(event) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        previewImage.value = reader.result
      }
      reader.readAsDataURL(file)
    }
  }
  
  function submitCheckout() {
    if (['bnctl', 'mandiri', 'bnu'].includes(payment.value) && !previewImage.value) {
      alert('❌ Harap unggah bukti transfer terlebih dahulu!')
      return
    }
  
    alert(`Metode: ${payment.value.toUpperCase()}\nTotal: $${total.value.toFixed(2)}\n✅ Pagamentu Susesu!`)
    cartStore.clearCart()
    router.push('/')
  }
  </script>
  