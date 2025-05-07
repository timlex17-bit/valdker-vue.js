// src/stores/cart.js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    total(state) {
      return state.items.reduce((sum, item) => sum + item.subtotal, 0)
    }
  },
  actions: {
    addToCart(product) {
      const existing = this.items.find(i => i.product.id === product.id)
      if (existing) {
        existing.quantity++
        existing.subtotal = existing.quantity * product.price
      } else {
        this.items.push({ product, quantity: 1, subtotal: product.price })
      }
    },
    clearCart() {
      this.items = []
    }
  },
  persist: true
})
