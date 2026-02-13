<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">🧾 Checkout</h1>

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

    <div class="mb-6">
      <label class="font-medium text-gray-700 block">Total Pagamentu:</label>
      <div class="text-xl font-bold mt-1">$ {{ totalNumber.toFixed(2) }}</div>
      <p class="text-xs text-gray-500 mt-1">
        Items: {{ androidCart.length }} | Token: {{ androidToken ? "YES" : "NO" }}
      </p>
    </div>

    <div v-if="payment === 'qris'" class="mb-6 text-center">
      <h3 class="font-semibold mb-2">📱 SCAN QRIS MOSAN</h3>
      <img src="@/assets/qris.png" alt="QRIS" class="w-48 mx-auto border rounded shadow" />
    </div>

    <div v-if="['bnctl','mandiri','bnu'].includes(payment)" class="mb-6">
      <label class="block font-medium text-gray-700 mb-2">🖼️ Upload Prova Transferensia</label>
      <input type="file" @change="handleUpload" accept="image/*" class="w-full border rounded px-3 py-2" />
      <p v-if="previewImage" class="mt-2 text-sm text-gray-600">✅ Prova upload ona ho susesu</p>
    </div>

    <button
      @click="submitCheckout"
      :disabled="submitting || androidCart.length === 0 || !androidToken"
      class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold disabled:opacity-40"
    >
      {{ submitting ? "⏳ Saving..." : "✅ Kontinua Pagamentu" }}
    </button>

    <!-- DEBUG ACTIONS -->
    <div class="mt-4 flex gap-2">
      <button class="flex-1 border rounded py-2" @click="pingAndroid">Ping Android</button>
      <button class="flex-1 border rounded py-2" @click="reloadPayload">Reload Payload</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import axios from "axios"

// ✅ your backend base
const API_BASE = "https://valdker.onrender.com/api"

const payment = ref("cash")
const previewImage = ref(null)
const submitting = ref(false)

// ✅ payload from Android
const androidToken = ref("")
const androidCart = ref([]) // [{product, quantity}]
const androidSubtotal = ref(0)
const androidCustomerId = ref(null)

// -----------------------------
// helpers
// -----------------------------
function toMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return "0.00"
  return n.toFixed(2)
}

function handleUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => (previewImage.value = reader.result)
  reader.readAsDataURL(file)
}

function logAndroid(msg) {
  try {
    if (window.Android?.log) window.Android.log(String(msg))
  } catch (_) {}
}

function readAndroidPayload() {
  // from injection
  const p = window.__CHECKOUT_PAYLOAD__
  if (!p) return false

  androidToken.value = (p.token || "").trim()
  androidSubtotal.value = Number(p.subtotal || 0) || 0
  androidCustomerId.value = p.customer_id ?? null

  // cart expected: [{product, quantity}]
  androidCart.value = Array.isArray(p.cart) ? p.cart : []

  logAndroid("[Vue] payload loaded token=" + (androidToken.value ? "YES" : "NO") + " items=" + androidCart.value.length)
  return true
}

function reloadPayload() {
  const ok = readAndroidPayload()
  if (!ok) alert("Payload belum ada. Pastikan Android sudah inject.")
}

const totalNumber = computed(() => {
  // prefer subtotal from Android (source of truth from CartManager)
  const s = Number(androidSubtotal.value)
  if (Number.isFinite(s) && s > 0) return s

  // fallback: compute from items if backend price fetch later
  return 0
})

// -----------------------------
// Fetch product price from backend (secure)
// -----------------------------
async function fetchSellPrice(productId) {
  const res = await axios.get(`${API_BASE}/products/${productId}/`, {
    headers: { Authorization: `Token ${androidToken.value}` },
  })
  // DRF returns sell_price as string (decimal)
  return res.data?.sell_price ?? "0.00"
}

async function submitCheckout() {
  if (!androidToken.value) {
    alert("❌ Token kosong. Silakan login ulang di Android.")
    return
  }
  if (androidCart.value.length === 0) {
    alert("Cart kosong!")
    return
  }
  if (["bnctl", "mandiri", "bnu"].includes(payment.value) && !previewImage.value) {
    alert("❌ Harap unggah bukti transfer terlebih dahulu!")
    return
  }

  submitting.value = true
  try {
    // Build items by fetching price from backend (BEST PRACTICE)
    const items = []
    for (const it of androidCart.value) {
      const pid = Number(it.product)
      const qty = Number(it.quantity || 1)

      if (!pid || !qty) throw new Error("Cart item invalid: " + JSON.stringify(it))

      const sellPrice = await fetchSellPrice(pid)

      items.push({
        product: pid,
        quantity: qty,
        price: toMoney(sellPrice),
        weight_unit: null,
      })
    }

    const safeTotal = toMoney(androidSubtotal.value || 0)
    const backendPayment = ["cash", "qris", "card", "bnctl", "mandiri", "bnu"].includes(payment.value)
      ? payment.value
      : "cash"

    const orderPayload = {
      customer: androidCustomerId.value ?? null,
      payment_method: backendPayment,
      subtotal: safeTotal,
      discount: "0.00",
      tax: "0.00",
      total: safeTotal,
      notes: "",
      is_paid: true,
      items,
    }

    console.log("ORDER PAYLOAD:", orderPayload)
    logAndroid("[Vue] posting order...")

    const res = await axios.post(`${API_BASE}/orders/`, orderPayload, {
      headers: { Authorization: `Token ${androidToken.value}` },
    })

    const orderId = res.data?.id
    logAndroid("[Vue] order success id=" + orderId)

    alert("✅ Pagamentu Susesu! Order saved.")

    // ✅ IMPORTANT: Call Android bridge
    if (window.Android?.onCheckoutSuccess) {
      window.Android.onCheckoutSuccess(String(orderId ?? ""))
    } else {
      alert("Android bridge not found. (window.Android.onCheckoutSuccess)")
    }
  } catch (err) {
    console.error("Checkout error:", err)
    logAndroid("[Vue] checkout error: " + (err?.message || "unknown"))

    if (err?.response?.data) {
      alert("❌ Checkout gagal:\n" + JSON.stringify(err.response.data, null, 2))
    } else {
      alert("❌ Checkout gagal:\n" + (err?.message || "Unknown error"))
    }
  } finally {
    submitting.value = false
  }
}

// ✅ debug to confirm bridge works
function pingAndroid() {
  try {
    if (window.Android?.log) window.Android.log("Ping from Vue OK")
    if (window.Android?.onCheckoutSuccess) window.Android.onCheckoutSuccess("999")
    else alert("Android bridge not found")
  } catch (e) {
    alert("Ping error: " + e.message)
  }
}

// Listen event from Android injection
function onPayloadEvent(e) {
  try {
    const d = e?.detail
    if (!d) return
    window.__CHECKOUT_PAYLOAD__ = d
    readAndroidPayload()
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  window.addEventListener("android-checkout-payload", onPayloadEvent)
  // initial read (in case injection already happened)
  setTimeout(() => {
    readAndroidPayload()
  }, 50)
})

onBeforeUnmount(() => {
  window.removeEventListener("android-checkout-payload", onPayloadEvent)
})
</script>
