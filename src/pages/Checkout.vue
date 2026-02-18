<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">🧾 Checkout</h1>

    <!-- ✅ Order Type summary -->
    <div class="mb-4 border rounded p-4 bg-gray-50">
      <div class="font-semibold text-gray-800 mb-2">🍽️ Order Type</div>

      <div class="flex flex-wrap gap-2">
        <span class="px-3 py-1 rounded-full text-sm border"
              :class="defaultOrderType === 'DINE_IN' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'">
          Dine-In
        </span>
        <span class="px-3 py-1 rounded-full text-sm border"
              :class="defaultOrderType === 'TAKE_OUT' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'">
          Take-Out
        </span>
        <span class="px-3 py-1 rounded-full text-sm border"
              :class="defaultOrderType === 'DELIVERY' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'">
          Delivery
        </span>
      </div>

      <div v-if="needsTableNumber" class="mt-3">
        <label class="text-sm font-medium text-gray-700 block mb-1">Table Number</label>
        <input v-model="tableNumber" class="w-full border rounded px-3 py-2" placeholder="e.g. A1" />
      </div>

      <div v-if="needsDeliveryAddress" class="mt-3">
        <label class="text-sm font-medium text-gray-700 block mb-1">Delivery Address</label>
        <textarea v-model="deliveryAddress" class="w-full border rounded px-3 py-2" rows="2"></textarea>

        <label class="text-sm font-medium text-gray-700 block mb-1 mt-2">Delivery Fee</label>
        <input v-model="deliveryFee" type="number" step="0.01" class="w-full border rounded px-3 py-2" />
      </div>

      <p class="text-xs text-gray-500 mt-2">
        Items override will be sent per item when available.
      </p>
    </div>

    <!-- Payment -->
    <div class="mb-4">
      <label class="font-medium text-gray-700 mb-2 block">Metode Pagamentu:</label>
      <select v-model="payment" class="w-full border rounded px-4 py-2">
        <option value="cash">💵 Cash - (Selu Iha Kasir)</option>
        <option value="qris">📱 QRIS MOSAN</option>
        <option value="bnctl">🏦 Transferensia - BNCTL</option>
        <option value="mandiri">🏦 Transferensia - Mandiri</option>
        <option value="bnu">🏦 Transferensia - BNU</option>
      </select>
    </div>

    <!-- Total -->
    <div class="mb-6">
      <label class="font-medium text-gray-700 block">Total Pagamentu:</label>
      <div class="text-xl font-bold mt-1">$ {{ totalNumber.toFixed(2) }}</div>
      <p class="text-xs text-gray-500 mt-1">
        Items: {{ androidItems.length }} | Token: {{ androidToken ? "YES" : "NO" }}
      </p>
    </div>

    <!-- ✅ DEBUG: Order type per item -->
    <div class="mb-6 border rounded p-4">
      <div class="font-semibold mb-2">🧺 Items (Order Type per item)</div>

      <div
        v-for="(it, idx) in androidItems"
        :key="idx"
        class="flex justify-between py-2 border-b last:border-b-0"
      >
        <div>Product: {{ it.product }} × {{ it.quantity }}</div>

        <div class="text-sm font-semibold">
          <span v-if="it.order_type === 'DINE_IN'">🍽️ DINE_IN</span>
          <span v-else-if="it.order_type === 'DELIVERY'">🚚 DELIVERY</span>
          <span v-else>🥡 TAKE_OUT</span>
        </div>
      </div>
    </div>

    <!-- QRIS -->
    <div v-if="payment === 'qris'" class="mb-6 text-center">
      <h3 class="font-semibold mb-2">📱 SCAN QRIS MOSAN</h3>
      <img src="@/assets/qris.png" class="w-48 mx-auto border rounded shadow" />
    </div>

    <!-- Bank transfer -->
    <div v-if="['bnctl','mandiri','bnu'].includes(payment)" class="mb-6">
      <label class="block font-medium text-gray-700 mb-2">🖼️ Upload Prova Transferensia</label>
      <input type="file" @change="handleUpload" accept="image/*" class="w-full border rounded px-3 py-2" />
    </div>

    <button
      @click="submitCheckout"
      :disabled="submitting || androidItems.length === 0 || !androidToken"
      class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold disabled:opacity-40"
    >
      {{ submitting ? "⏳ Saving..." : "✅ Kontinua Pagamentu" }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import axios from "axios"

const API_BASE = "https://valdker.onrender.com/api"

const payment = ref("cash")
const previewImage = ref(null)
const submitting = ref(false)

const androidToken = ref("")
const androidItems = ref([])
const androidSubtotal = ref(0)
const androidCustomerId = ref(null)

const defaultOrderType = ref("TAKE_OUT")
const tableNumber = ref("")
const deliveryAddress = ref("")
const deliveryFee = ref("0.00")

function toMoney(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : "0.00"
}

function normalizeOrderType(v) {
  const s = String(v || "").trim().toUpperCase()
  if (["DINE_IN","TAKE_OUT","DELIVERY"].includes(s)) return s
  return "TAKE_OUT"
}

function readAndroidPayload() {
  const p = window.__CHECKOUT_PAYLOAD__
  if (!p) return false

  androidToken.value = (p.token || "").trim()
  androidSubtotal.value = Number(p.subtotal || 0) || 0
  androidCustomerId.value = p.customer_id ?? null

  defaultOrderType.value = normalizeOrderType(
    p.default_order_type || p.defaultOrderType || "TAKE_OUT"
  )

  tableNumber.value = (p.table_number || "").toString()
  deliveryAddress.value = (p.delivery_address || "").toString()
  deliveryFee.value = toMoney(p.delivery_fee ?? 0)

  // ✅ NORMALIZED ITEMS (FIX UTAMA)
  const src =
    Array.isArray(p.items) ? p.items :
    Array.isArray(p.cart) ? p.cart :
    []

  androidItems.value = src.map(it => ({
    product: it.product,
    quantity: it.quantity,
    order_type: normalizeOrderType(
      it.order_type || it.orderType || defaultOrderType.value
    )
  }))

  console.log("ANDROID ITEMS:", androidItems.value)

  return true
}

const totalNumber = computed(() => {
  const s = Number(androidSubtotal.value)
  return Number.isFinite(s) && s > 0 ? s : 0
})

const needsTableNumber = computed(() =>
  androidItems.value.some(it => it.order_type === "DINE_IN")
)

const needsDeliveryAddress = computed(() =>
  androidItems.value.some(it => it.order_type === "DELIVERY")
)

onMounted(() => {
  window.addEventListener("android-checkout-payload", (e) => {
    window.__CHECKOUT_PAYLOAD__ = e.detail
    readAndroidPayload()
  })
  setTimeout(readAndroidPayload, 50)
})

onBeforeUnmount(() => {
  window.removeEventListener("android-checkout-payload", readAndroidPayload)
})
</script>
