import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  getters: {
    total(state) {
      return state.items.reduce((sum, item) => {
        if (typeof item.subtotal === 'number') return sum + item.subtotal
        const price = Number(item?.price ?? item?.product?.price ?? 0)
        const qty = Number(item?.qty ?? item?.quantity ?? 1)
        return sum + price * qty
      }, 0)
    }
  },

  actions: {
    _normalizeItem(oldItem) {
      if (oldItem && oldItem.id != null && oldItem.name != null && oldItem.price != null) {
        const price = Number(oldItem.price || 0)
        const qty = Number(oldItem.qty || 1)
        return {
          ...oldItem,
          image: oldItem.image || '/placeholder.png',
          price,
          qty,
          subtotal: Number(oldItem.subtotal ?? price * qty)
        }
      }

      const p = oldItem?.product || {}
      const price = Number(p.price || 0)
      const qty = Number(oldItem?.quantity || 1)
      const image = p.image || p.image_url || '/placeholder.png'

      return {
        id: p.id,
        name: p.name,
        image,
        price,
        qty,
        subtotal: Number(oldItem?.subtotal ?? price * qty)
      }
    },

    _ensureNormalized() {
      if (!Array.isArray(this.items) || this.items.length === 0) return
      const need = this.items.some((it) => it && it.product)
      if (need) {
        this.items = this.items.map((it) => this._normalizeItem(it))
      }
    },

    addToCart(product) {
      this._ensureNormalized()

      const p = {
        ...product,
        image: product?.image || product?.image_url || '/placeholder.png',
        price: Number(product?.price || 0)
      }

      const existing = this.items.find(i => i.id === p.id)
      if (existing) {
        existing.qty = Number(existing.qty || 1) + 1
        existing.subtotal = Number(existing.qty) * Number(existing.price || 0)

        if (!existing.image) existing.image = p.image
      } else {
        this.items.push({
          id: p.id,
          name: p.name,
          image: p.image,
          price: p.price,
          qty: 1,
          subtotal: p.price
        })
      }
    },

    increaseQty(id) {
      this._ensureNormalized()
      const it = this.items.find(x => x.id === id)
      if (!it) return
      it.qty = Number(it.qty || 1) + 1
      it.subtotal = Number(it.qty) * Number(it.price || 0)
    },

    decreaseQty(id) {
      this._ensureNormalized()
      const it = this.items.find(x => x.id === id)
      if (!it) return
      it.qty = Number(it.qty || 1) - 1
      if (it.qty <= 0) {
        this.items = this.items.filter(x => x.id !== id)
      } else {
        it.subtotal = Number(it.qty) * Number(it.price || 0)
      }
    },

    clearCart() {
      this.items = []
    }
  },

  persist: true
})
