<template>
    <div class="product-card">
      <img :src="product.image" alt="Product Image" class="w-20 h-20 object-cover mb-2" />
      <h3>{{ product.name }}</h3>
      <p>{{ product.price }} USD</p>
      <button @click="$emit('add-to-cart', product)">Add to Cart</button>
    </div>
  </template>
  
  <script setup>
  defineProps({
    product: Object
  })
  </script>