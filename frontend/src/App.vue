<template>
  <div id="app">
    <div class="shipping-banner">We currently ship to the United States only.</div>
    <Header />
    <div v-if="itemCount > 0" class="cart-expiry-banner">
      Items in your cart are held for 15 minutes — complete checkout before your reservation expires.
    </div>
    <router-view />
    <Footer />
    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { useCart } from './stores/cart'
import { useShop } from './stores/shop'
import { api } from './services/api'

const { toast, itemCount } = useCart()
const { shopEnabled } = useShop()

onMounted(async () => {
  const config = await api.getConfig()
  shopEnabled.value = config.shopEnabled
})
</script>

<style>
@import './assets/global.css';
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.body {
  margin: 0;
}

.shipping-banner {
  background-color: #111;
  color: #999;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  letter-spacing: 0.5px;
  text-align: center;
  padding: 6px 16px;
}

.cart-expiry-banner {
  background-color: #1a1a1a;
  color: #ccc;
  font-family: "Dosis", sans-serif;
  font-size: 0.85rem;
  font-weight: 200;
  text-align: center;
  padding: 8px 16px;
  border-bottom: 1px solid #2a2a2a;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1a1a1a;
  color: #FEFCF3;
  border: 1px solid #444;
  font-family: "Dosis", sans-serif;
  font-size: 0.95rem;
  font-weight: 200;
  padding: 12px 24px;
  white-space: nowrap;
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
