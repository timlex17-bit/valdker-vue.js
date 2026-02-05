<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">🧾 Checkout</h1>

    <!-- Metode -->
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
      <div class="text-xl font-bold mt-1">$ {{ total.toFixed(2) }}</div>
    </div>

    <!-- QRIS -->
    <div v-if="payment === 'qris'" class="mb-6 text-center">
      <h3 class="font-semibold mb-2">📱 SCAN QRIS MOSAN</h3>
      <img src="@/assets/qris.png" alt="QRIS" class="w-48 mx-auto border rounded shadow" />
    </div>

    <!-- Upload bukti -->
    <div v-if="['bnctl', 'mandiri', 'bnu'].includes(payment)" class="mb-6">
      <label class="block font-medium text-gray-700 mb-2">🖼️ Upload Prova Transferensia</label>
      <input type="file" @change="handleUpload" accept="image/*" class="w-full border rounded px-3 py-2" />
      <p v-if="previewImage" class="mt-2 text-sm text-gray-600">✅ Prova upload ona ho susesu</p>
    </div>

    <button
      @click="submitCheckout"
      :disabled="submitting || cartItems.length === 0"
      class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold disabled:opacity-40"
    >
      {{ submitting ? "⏳ Saving..." : "✅ Kontinua Pagamentu" }}
    </button>
  </div>
</template>

<script setup>
import { useCartStore } from "@/stores/cart"
import { storeToRefs } from "pinia"
import { ref, computed, nextTick } from "vue"
import { createOrder } from "@/services/api"

const emit = defineEmits(["success"]) // ✅ penting

const cartStore = useCartStore()
const { total, items } = storeToRefs(cartStore)
const cartItems = computed(() => items.value || [])

const payment = ref("cash")
const previewImage = ref(null)
const submitting = ref(false)

function handleUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => (previewImage.value = reader.result)
  reader.readAsDataURL(file)
}

/**
 * ✅ helper supaya DecimalField aman:
 * - ubah ke number
 * - fix ke 2 desimal
 * - return STRING "1.80" (paling aman buat DRF DecimalField)
 */
function toMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return "0.00"
  return n.toFixed(2)
}

function getProductIdFromCartItem(it) {
  return (
    it?.product?.id ??
    it?.product_id ??
    it?.productId ??
    it?.productID ??
    it?.product_pk ??
    it?.id
  )
}

function buildPayload() {
  const backendPayment = ["cash", "qris", "card"].includes(payment.value) ? payment.value : "cash"

  const mappedItems = cartItems.value.map((it) => {
    const productId = getProductIdFromCartItem(it)
    return {
      product: productId,
      quantity: Number(it.qty || it.quantity || 1),
      // ✅ amanin juga price jadi 2 desimal
      price: toMoney(it.price || it.sell_price || 0),
      weight_unit: null,
    }
  })

  const badIndex = mappedItems.findIndex((x) => !x.product)
  if (badIndex !== -1) {
    console.log("CART ITEMS RAW:", cartItems.value)
    console.log("MAPPED ITEMS:", mappedItems)
    throw new Error(`Cart item index ${badIndex} tidak punya product id.`)
  }

  // ✅ subtotal/total wajib aman 2 desimal agar tidak melebihi max_digits
  const safeTotal = toMoney(total.value || 0)

  return {
    customer: 1,
    payment_method: backendPayment,
    subtotal: safeTotal,
    discount: "0.00",
    tax: "0.00",
    total: safeTotal,
    notes: "",
    is_paid: true,
    items: mappedItems,
  }
}

async function submitCheckout() {
  if (cartItems.value.length === 0) return alert("Cart kosong!")
  if (["bnctl", "mandiri", "bnu"].includes(payment.value) && !previewImage.value) {
    return alert("❌ Harap unggah bukti transfer terlebih dahulu!")
  }

  submitting.value = true
  try {
    const payload = buildPayload()
    console.log("PAYLOAD CHECKOUT:", payload)

    const res = await createOrder(payload)
    console.log("ORDER SAVED:", res.data)

    alert("✅ Pagamentu Susesu! Order saved.")
    cartStore.clearCart()

    await nextTick()
    console.log("✅ EMIT success() untuk tutup modal")
    emit("success")
  } catch (err) {
    console.error("Checkout error:", err)
    if (!err?.response) {
      alert("❌ Checkout gagal:\n" + (err?.message || "Unknown error"))
      return
    }
    const data = err?.response?.data
    console.log("BACKEND ERROR DATA:", data)
    alert("❌ Checkout gagal:\n" + JSON.stringify(data, null, 2))
  } finally {
    submitting.value = false
  }
}
</script>
