<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">🧾 Checkout</h1>

    <!-- ✅ NEW: Order Type summary -->
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

      <!-- extra fields (shown only if relevant) -->
      <div v-if="needsTableNumber" class="mt-3">
        <label class="text-sm font-medium text-gray-700 block mb-1">Table Number</label>
        <input v-model="tableNumber" class="w-full border rounded px-3 py-2" placeholder="e.g. A1" />
      </div>

      <div v-if="needsDeliveryAddress" class="mt-3">
        <label class="text-sm font-medium text-gray-700 block mb-1">Delivery Address</label>
        <textarea v-model="deliveryAddress" class="w-full border rounded px-3 py-2" rows="2" placeholder="Enter delivery address"></textarea>

        <label class="text-sm font-medium text-gray-700 block mb-1 mt-2">Delivery Fee</label>
        <input v-model="deliveryFee" type="number" step="0.01" class="w-full border rounded px-3 py-2" placeholder="0.00" />
      </div>

      <p class="text-xs text-gray-500 mt-2">
        Items override will be sent per item when available.
      </p>
    </div>

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
        Items: {{ androidItems.length }} | Token: {{ androidToken ? "YES" : "NO" }}
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
      :disabled="submitting || androidItems.length === 0 || !androidToken"
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
const androidItems = ref([]) // [{product, quantity, order_type?}] OR from legacy cart [{product, quantity}]
const androidSubtotal = ref(0)
const androidCustomerId = ref(null)

// ✅ NEW: order type header (global)
const defaultOrderType = ref("TAKE_OUT") // default fallback
const tableNumber = ref("")
const deliveryAddress = ref("")
const deliveryFee = ref("0.00")

// -----------------------------
// helpers
// -----------------------------
function toMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return "0.00"
  return n.toFixed(2)
}

function normalizeOrderType(v) {
  const s = String(v || "").trim().toUpperCase()
  if (s === "DINE_IN" || s === "TAKE_OUT" || s === "DELIVERY") return s
  return "TAKE_OUT"
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
  const p = window.__CHECKOUT_PAYLOAD__
  if (!p) return false

  androidToken.value = (p.token || "").trim()
  androidSubtotal.value = Number(p.subtotal || 0) || 0
  androidCustomerId.value = p.customer_id ?? null

  // ✅ NEW: read default order type + extra
  defaultOrderType.value = normalizeOrderType(p.default_order_type || p.defaultOrderType || "TAKE_OUT")
  tableNumber.value = (p.table_number || p.tableNumber || "").toString()
  deliveryAddress.value = (p.delivery_address || p.deliveryAddress || "").toString()
  deliveryFee.value = toMoney(p.delivery_fee ?? p.deliveryFee ?? 0)

  // ✅ Prefer items (new) else fallback to cart (legacy)
  if (Array.isArray(p.items)) {
    androidItems.value = p.items
  } else if (Array.isArray(p.cart)) {
    // legacy cart -> convert to items with default type
    androidItems.value = p.cart.map((it) => ({
      product: it.product,
      quantity: it.quantity,
      order_type: defaultOrderType.value,
    }))
  } else {
    androidItems.value = []
  }

  logAndroid(
    "[Vue] payload loaded token=" +
      (androidToken.value ? "YES" : "NO") +
      " items=" +
      androidItems.value.length +
      " defaultType=" +
      defaultOrderType.value
  )
  return true
}

function reloadPayload() {
  const ok = readAndroidPayload()
  if (!ok) alert("Payload belum ada. Pastikan Android sudah inject.")
}

const totalNumber = computed(() => {
  const s = Number(androidSubtotal.value)
  if (Number.isFinite(s) && s > 0) return s
  return 0
})

const needsTableNumber = computed(() => {
  // if any item is dine-in
  return androidItems.value.some((it) => normalizeOrderType(it.order_type) === "DINE_IN") || defaultOrderType.value === "DINE_IN"
})

const needsDeliveryAddress = computed(() => {
  return androidItems.value.some((it) => normalizeOrderType(it.order_type) === "DELIVERY") || defaultOrderType.value === "DELIVERY"
})

// -----------------------------
// Fetch product price from backend (secure)
// -----------------------------
async function fetchSellPrice(productId) {
  const res = await axios.get(`${API_BASE}/products/${productId}/`, {
    headers: { Authorization: `Token ${androidToken.value}` },
  })
  return res.data?.sell_price ?? "0.00"
}

async function submitCheckout() {
  if (!androidToken.value) {
    alert("❌ Token kosong. Silakan login ulang di Android.")
    return
  }
  if (androidItems.value.length === 0) {
    alert("Cart kosong!")
    return
  }
  if (["bnctl", "mandiri", "bnu"].includes(payment.value) && !previewImage.value) {
    alert("❌ Harap unggah bukti transfer terlebih dahulu!")
    return
  }

  // ✅ validate required fields based on type rules
  if (needsTableNumber.value && !String(tableNumber.value || "").trim()) {
    alert("❌ Table number wajib untuk Dine-In.")
    return
  }
  if (needsDeliveryAddress.value && !String(deliveryAddress.value || "").trim()) {
    alert("❌ Delivery address wajib untuk Delivery.")
    return
  }

  submitting.value = true
  try {
    const items = []
    for (const it of androidItems.value) {
      const pid = Number(it.product)
      const qty = Number(it.quantity || 1)

      if (!pid || !qty) throw new Error("Item invalid: " + JSON.stringify(it))

      const sellPrice = await fetchSellPrice(pid)

      items.push({
        product: pid,
        quantity: qty,
        price: toMoney(sellPrice),
        weight_unit: null,

        // ✅ IMPORTANT: send per-item type
        order_type: normalizeOrderType(it.order_type || defaultOrderType.value),
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

      // ✅ IMPORTANT: header fields
      default_order_type: normalizeOrderType(defaultOrderType.value),
      table_number: String(tableNumber.value || ""),
      delivery_address: String(deliveryAddress.value || ""),
      delivery_fee: toMoney(deliveryFee.value),

      items,
    }

    console.log("ORDER PAYLOAD:", orderPayload)
    logAndroid("[Vue] posting order with order_type...")

    const res = await axios.post(`${API_BASE}/orders/`, orderPayload, {
      headers: { Authorization: `Token ${androidToken.value}` },
    })

    const orderId = res.data?.id
    logAndroid("[Vue] order success id=" + orderId)

    alert("✅ Pagamentu Susesu! Order saved.")

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

function pingAndroid() {
  try {
    if (window.Android?.log) window.Android.log("Ping from Vue OK")
    if (window.Android?.onCheckoutSuccess) window.Android.onCheckoutSuccess("999")
    else alert("Android bridge not found")
  } catch (e) {
    alert("Ping error: " + e.message)
  }
}

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
  setTimeout(() => {
    readAndroidPayload()
  }, 50)
})

onBeforeUnmount(() => {
  window.removeEventListener("android-checkout-payload", onPayloadEvent)
})
</script>
