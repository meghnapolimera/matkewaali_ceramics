<template>
  <div class="cart-page">
    <div class="cart-container">
      <div v-if="items.length === 0" class="cart-empty">
        <p>Your cart is empty.</p>
        <router-link to="/products" class="continue-link">Continue shopping</router-link>
      </div>

      <div v-else>
        <div class="cart-items">
          <div v-for="item in items" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.name" />
            </div>

            <div class="item-details">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-price">${{ item.price }}</span>
              <span class="item-expires">Reserved until {{ formatExpiry(item.lockedUntil) }}</span>
            </div>

            <div class="item-total">${{ item.price }}</div>

            <button class="remove-btn" @click="handleRemove(item)">✕</button>
          </div>
        </div>

        <div class="cart-footer">
          <div class="cart-total">
            <span>Total</span>
            <span>${{ total }}</span>
          </div>
          <p v-if="!shopEnabled" class="shop-closed-note">Shop is currently closed — checkout is unavailable.</p>
          <button v-else class="checkout-btn" @click="router.push('/checkout')">Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCart } from '@/stores/cart'
import { useShop } from '@/stores/shop'
import { api } from '@/services/api'

const { shopEnabled } = useShop()

const router = useRouter()
const { items, total, removeItem } = useCart()

function formatExpiry(lockedUntil: number): string {
  return new Date(lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function handleRemove(item: { id: string; lockId: string }) {
  api.releaseLock(item.lockId)
  removeItem(item.id)
}
</script>

<style scoped>
.shop-closed-note {
  font-family: "Dosis", sans-serif;
  font-size: 0.9rem;
  font-weight: 200;
  color: #999;
  text-align: center;
  margin: 0;
}

.cart-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 0 36px 40px;
}

.cart-container {
  max-width: 800px;
  margin: 0 auto;
}

.cart-empty {
  text-align: center;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-empty p {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 200;
  color: #FEFCF3;
  margin: 0;
}

.continue-link {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 200;
  color: #FEFCF3;
  text-decoration: underline;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #222;
}

.item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 200;
  color: #FEFCF3;
}

.item-price {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  color: #999;
}

.item-expires {
  font-family: "Dosis", sans-serif;
  font-size: 0.85rem;
  font-weight: 200;
  color: #666;
}

.item-total {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 200;
  color: #FEFCF3;
  min-width: 50px;
  text-align: right;
}

.remove-btn {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: #FEFCF3;
}

.cart-footer {
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
}

.cart-total {
  display: flex;
  gap: 40px;
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 200;
  color: #FEFCF3;
}

.checkout-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  letter-spacing: 1.5px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 10px 28px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.checkout-btn:hover {
  background-color: #FEFCF3;
  color: black;
}
</style>
