<template>
  <div class="products-page">
    <div v-if="loading" class="status-message">
      <span class="spinner"></span>
    </div>

    <div v-else-if="error" class="status-message">
      <p>Unable to load products, please try again.</p>
      <button class="retry-btn" @click="fetchProducts">Retry</button>
    </div>

    <div v-else class="products-grid">
      <router-link
        v-for="product in products"
        :key="product.slug"
        :to="`/products/${product.slug}`"
        class="product-card"
      >
        <div class="product-thumbnail" :class="{ 'is-sold-out': product.soldOut }">
          <img :src="product.imageUrl" :alt="product.name" />
          <div v-if="product.soldOut" class="sold-out-badge">Sold Out</div>
        </div>
        <div class="product-info">
          <span class="product-name">{{ product.name }}</span>
          <span class="product-price">${{ product.price }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, Product, ApiError } from '@/services/api'

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref(false)

async function fetchProducts() {
  loading.value = true
  error.value = false
  try {
    products.value = await api.getProducts()
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = true
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)
</script>

<style scoped>
.products-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 0 36px;
}

.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 80px 20px;
  color: #FEFCF3;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
}

.spinner {
  display: block;
  width: 32px;
  height: 32px;
  border: 2px solid #333;
  border-top-color: #FEFCF3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 8px 24px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.retry-btn:hover {
  background-color: #FEFCF3;
  color: black;
}

.products-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px;
}

.product-card {
  text-decoration: none;
  background-color: black;
  transition: transform 0.2s ease;
  cursor: pointer;
  display: block;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-thumbnail {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  position: relative;
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-thumbnail.is-sold-out img {
  opacity: 0.7;
}

.sold-out-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.55);
  color: #FEFCF3;
  font-family: "Dosis", sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 0;
  text-align: center;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 12px 0 0 0;
}

.product-name {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: #FEFCF3;
  letter-spacing: 0.5px;
}

.product-price {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: #FEFCF3;
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 30px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-card {
    transition: none;
  }
  .spinner {
    animation: none;
  }
}
</style>
