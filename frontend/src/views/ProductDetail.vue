<template>
  <div class="product-detail">
    <div v-if="loading" class="status-message">
      <span class="spinner"></span>
    </div>

    <div v-else-if="notFound" class="status-message">
      <h1>404</h1>
      <p>This product doesn't exist or may have been removed.</p>
      <router-link to="/products" class="back-link">Back to Shop</router-link>
    </div>

    <div v-else-if="error" class="status-message">
      <p>Something went wrong. Please try again.</p>
      <button class="retry-btn" @click="loadProduct">Retry</button>
    </div>

    <div v-else-if="product" class="product-container">
      <div class="product-image">
        <img :src="product.imageUrl" :alt="product.name" loading="lazy" />
      </div>

      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-price">${{ product.price }}</p>

        <p v-if="product.description" class="product-description">{{ product.description }}</p>

        <div v-if="product.height || product.width || product.volume" class="product-details">
          <p v-if="product.height" class="detail-item">Height: {{ product.height }}</p>
          <p v-if="product.width" class="detail-item">Width: {{ product.width }}</p>
          <p v-if="product.volume" class="detail-item">Volume: {{ product.volume }}</p>
        </div>

        <div class="product-notes">
          <p>All items are individually handmade, please allow variations between them and the images displayed</p>
          <p>All items are food and dishwasher safe, however hand wash with care is highly recommended</p>
        </div>

        <button v-if="!shopEnabled" class="sold-out-btn" disabled>Shop is currently closed</button>
        <button v-else-if="product.soldOut" class="sold-out-btn" disabled>Sold Out</button>
        <button v-else-if="unavailable" class="sold-out-btn" disabled>Sold Out</button>
        <button v-else class="add-to-cart" @click="addToCart">{{ added ? 'Added' : 'Add to Cart' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api, type Product, NotFoundError, ApiError, LockConflictError } from '@/services/api'
import { useCart } from '@/stores/cart'
import { useShop } from '@/stores/shop'

const { shopEnabled } = useShop()

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)
const notFound = ref(false)
const error = ref(false)
const { addItem } = useCart()
const added = ref(false)
const unavailable = ref(false)

async function loadProduct() {
  loading.value = true
  notFound.value = false
  error.value = false
  try {
    product.value = await api.getProduct(route.params.slug as string)
  } catch (e) {
    if (e instanceof NotFoundError) {
      notFound.value = true
    } else if (e instanceof ApiError) {
      error.value = true
    }
  } finally {
    loading.value = false
  }
}

async function addToCart() {
  if (!product.value) return
  const slug = product.value.slug
  try {
    const { lockId, expiresAt } = await api.createLock(slug)
    addItem({
      id: slug,
      slug,
      name: product.value.name,
      price: product.value.price,
      image: product.value.imageUrl,
      lockId,
      lockedUntil: expiresAt * 1000,
    })
    api.recordEvent('add_to_cart', { slug })
    added.value = true
    setTimeout(() => {
      added.value = false
      if (product.value) product.value.soldOut = true
    }, 1500)
  } catch (e) {
    if (e instanceof LockConflictError) {
      unavailable.value = true
    }
  }
}

onMounted(loadProduct)
watch(() => route.params.slug, loadProduct)
</script>

<style scoped>
.product-detail {
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
  text-align: center;
}

.status-message h1 {
  font-size: 3rem;
  font-weight: 200;
  margin: 0;
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

.back-link, .retry-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 8px 24px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.back-link:hover, .retry-btn:hover {
  background-color: #FEFCF3;
  color: black;
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-image {
  width: 100%;
}

.product-image img {
  width: 100%;
  height: auto;
  display: block;
}

.product-info {
  flex: 1;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-name {
  font-family: "Dosis", sans-serif;
  font-size: 1.25rem;
  color: #FEFCF3;
  margin: 0;
  font-weight: 200;
  line-height: 1.2;
}

.product-price {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  color: #FEFCF3;
  margin: 0;
  font-weight: 300;
}

.product-description {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #FEFCF3;
  margin: 0;
  font-weight: 200;
  text-align: justify;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
}

.detail-item {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  color: #FEFCF3;
  margin: 0;
}

.add-to-cart, .sold-out-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1.5px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 10px 28px;
  width: auto;
  align-self: flex-start;
}

.add-to-cart {
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.add-to-cart:hover {
  background-color: #FEFCF3;
  color: black;
}

.sold-out-btn {
  cursor: not-allowed;
  opacity: 0.5;
}

.product-notes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #333;
  margin: 0;
  padding: 16px 0 0 0;
}

.product-notes p {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  color: #ccc;
  margin: 0;
  line-height: 1.5;
  text-align: justify;
}

/* Desktop layout */
@media (min-width: 768px) {
  .product-container {
    flex-direction: row;
    align-items: flex-start;
    gap: 60px;
  }

  .product-image {
    flex: 1;
    position: sticky;
    top: 24vh;
  }

  .product-name {
    font-size: 1.4rem;
    font-weight: 200;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
