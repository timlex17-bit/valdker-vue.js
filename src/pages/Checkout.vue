<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">🧾 Checkout</h1>

    <!-- ✅ Order Type summary -->
    <div class="mb-4 border rounded p-4 bg-gray-50">
      <div class="font-semibold text-gray-800 mb-2">🍽️ Order Type</div>

      <div class="flex flex-wrap gap-2">
        <span
          class="px-3 py-1 rounded-full text-sm border"
          :class="defaultOrderType === 'GENERAL' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'"
        >
          General
        </span>

        <span
          class="px-3 py-1 rounded-full text-sm border"
          :class="defaultOrderType === 'DINE_IN' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'"
        >
          Dine-In
        </span>

        <span
          class="px-3 py-1 rounded-full text-sm border"
          :class="defaultOrderType === 'TAKE_OUT' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'"
        >
          Take-Out
        </span>

        <span
          class="px-3 py-1 rounded-full text-sm border"
          :class="defaultOrderType === 'DELIVERY' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'"
        >
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
        <input
          v-model="deliveryFee"
          type="number"
          step="0.01"
          class="w-full border rounded px-3 py-2"
        />

        <p class="text-xs text-gray-500 mt-2">
          Total Pagamentu = Subtotal + Delivery Fee
        </p>
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

    <!-- ✅ Total -->
    <div class="mb-6">
      <label class="font-medium text-gray-700 block">Total Pagamentu:</label>
      <div class="text-xl font-bold mt-1">$ {{ totalNumber.toFixed(2) }}</div>

      <div class="text-xs text-gray-500 mt-1">
        <div>Subtotal: $ {{ subtotalNumber.toFixed(2) }}</div>
        <div v-if="deliveryFeeNumber > 0">Delivery Fee: $ {{ deliveryFeeNumber.toFixed(2) }}</div>
        <div>Items: {{ androidItems.length }} | Token: {{ androidToken ? "YES" : "NO" }}</div>
      </div>
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
          <span v-else-if="it.order_type === 'GENERAL'">🧾 GENERAL</span>
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
      <p v-if="previewImage" class="mt-2 text-sm text-gray-600">✅ Prova upload ona ho susesu</p>
    </div>

    <button
      @click="submitCheckout"
      @pointerdown="logAndroid('[Vue] pointerdown pay button')"
      @touchstart="logAndroid('[Vue] touchstart pay button')"
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
  if (["GENERAL", "DINE_IN", "TAKE_OUT", "DELIVERY"].includes(s)) return s
  return "TAKE_OUT"
}

function logAndroid(msg) {
  try {
    if (window.Android?.log) window.Android.log(String(msg))
  } catch (_) {}
}

function handleUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => (previewImage.value = reader.result)
  reader.readAsDataURL(file)
}

function readAndroidPayload() {
  const p = window.__CHECKOUT_PAYLOAD__
  if (!p) return false

  androidToken.value = (p.token || "").trim()
  androidSubtotal.value = Number(p.subtotal || 0) || 0
  androidCustomerId.value = p.customer_id ?? null

  // ✅ allow GENERAL from cart
  defaultOrderType.value = normalizeOrderType(
    p.default_order_type || p.defaultOrderType || "TAKE_OUT"
  )

  tableNumber.value = (p.table_number || p.tableNumber || "").toString()
  deliveryAddress.value = (p.delivery_address || p.deliveryAddress || "").toString()
  deliveryFee.value = toMoney(p.delivery_fee ?? p.deliveryFee ?? 0)

  const src =
    Array.isArray(p.items) ? p.items :
    Array.isArray(p.cart) ? p.cart :
    []

  androidItems.value = src.map((it) => ({
    product: it.product,
    quantity: it.quantity,
    // per item must still be DINE_IN/TAKE_OUT/DELIVERY (or GENERAL if you ever send it)
    order_type: normalizeOrderType(it.order_type || it.orderType || defaultOrderType.value),
  }))

  console.log("ANDROID ITEMS:", androidItems.value)
  logAndroid(
    `[Vue] payload loaded token=${androidToken.value ? "YES" : "NO"} items=${androidItems.value.length} defaultType=${defaultOrderType.value}`
  )
  return true
}

// ✅ numbers
const subtotalNumber = computed(() => {
  const s = Number(androidSubtotal.value)
  return Number.isFinite(s) && s > 0 ? s : 0
})

const deliveryFeeNumber = computed(() => {
  // only apply fee when delivery section is relevant; otherwise keep 0
  const n = Number(deliveryFee.value)
  if (!needsDeliveryAddress.value) return 0
  return Number.isFinite(n) && n > 0 ? n : 0
})

const totalNumber = computed(() => {
  return subtotalNumber.value + deliveryFeeNumber.value
})

const needsTableNumber = computed(() => {
  // ✅ do NOT trigger table when header is GENERAL
  const anyDineIn = androidItems.value.some((it) => normalizeOrderType(it.order_type) === "DINE_IN")
  return anyDineIn || defaultOrderType.value === "DINE_IN"
})

const needsDeliveryAddress = computed(() => {
  // ✅ do NOT trigger delivery when header is GENERAL (unless items actually have delivery)
  const anyDelivery = androidItems.value.some((it) => normalizeOrderType(it.order_type) === "DELIVERY")
  return anyDelivery || defaultOrderType.value === "DELIVERY"
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
  logAndroid("[Vue] submitCheckout clicked")

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

        // ✅ send per-item type (DINE_IN/TAKE_OUT/DELIVERY or GENERAL if you ever send it)
        order_type: normalizeOrderType(it.order_type || defaultOrderType.value),
      })
    }

    const safeSubtotal = toMoney(subtotalNumber.value)
    const safeDeliveryFee = toMoney(deliveryFeeNumber.value)
    const safeTotal = toMoney(totalNumber.value)

    const backendPayment = ["cash", "qris", "card", "bnctl", "mandiri", "bnu"].includes(payment.value)
      ? payment.value
      : "cash"

    const orderPayload = {
      customer: androidCustomerId.value ?? null,
      payment_method: backendPayment,

      // ✅ totals: total includes delivery fee automatically
      subtotal: safeSubtotal,
      discount: "0.00",
      tax: "0.00",
      total: safeTotal,

      notes: "",
      is_paid: true,

      // ✅ header fields
      default_order_type: normalizeOrderType(defaultOrderType.value),
      table_number: String(tableNumber.value || ""),
      delivery_address: String(deliveryAddress.value || ""),
      delivery_fee: safeDeliveryFee,

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

// ✅ keep same handler reference for add/remove
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
