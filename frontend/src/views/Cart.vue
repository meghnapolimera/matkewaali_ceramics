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
            </div>

            <div class="item-quantity">
              <button class="qty-btn" @click="updateQuantity(item.id, item.quantity - 1)">−</button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button class="qty-btn" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
            </div>

            <div class="item-total">${{ item.price * item.quantity }}</div>

            <button class="remove-btn" @click="removeItem(item.id)">✕</button>
          </div>
        </div>

        <div class="cart-footer">
          <div class="cart-total">
            <span>Total</span>
            <span>${{ total }}</span>
          </div>
          <button class="checkout-btn">Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '@/stores/cart'

const { items, total, removeItem, updateQuantity } = useCart()
</script>

<style scoped>
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
  gap: 6px;
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

.item-quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  background: none;
  border: 1px solid #444;
  color: #FEFCF3;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Dosis", sans-serif;
  transition: border-color 0.2s ease;
}

.qty-btn:hover {
  border-color: #FEFCF3;
}

.qty-value {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 200;
  color: #FEFCF3;
  min-width: 20px;
  text-align: center;
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
