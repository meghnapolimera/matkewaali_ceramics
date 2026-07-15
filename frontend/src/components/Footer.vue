<template>
  <footer class="footer">
    <div class="footer-content">

      <div class="footer-newsletter">
        <p class="footer-label">Subscribe for updates</p>
        <form v-if="!subscribed" @submit.prevent="handleSubmit" class="subscription-form">
          <input
            type="email"
            v-model="email"
            placeholder="Email address"
            required
            class="email-input"
          />
          <button type="submit" class="submit-button">Sign up</button>
        </form>
        <p v-else class="subscribed-msg">You're subscribed!</p>
      </div>

      <div class="footer-links">
        <router-link to="/contact" class="footer-link">Contact</router-link>
        <span class="footer-divider">·</span>
        <router-link to="/faq" class="footer-link">FAQ</router-link>
        <span class="footer-divider">·</span>
        <router-link to="/terms" class="footer-link">T&amp;C</router-link>
        <span class="footer-divider">·</span>
        <a href="https://www.instagram.com/matkewaali/" target="_blank" class="footer-link footer-ig">
          <i class="fab fa-instagram"></i>
        </a>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/services/api'

const email = ref('')
const subscribed = ref(false)

async function handleSubmit() {
  try {
    await api.subscribe(email.value)
    subscribed.value = true
    email.value = ''
  } catch {
    // silent — non-critical
  }
}
</script>

<style scoped>
.footer {
  background-color: black;
  padding: 40px 36px;
}

.footer-content {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.footer-label {
  font-family: "Dosis", sans-serif;
  font-size: 0.9rem;
  font-weight: 200;
  color: #FEFCF3;
  margin: 0 0 12px;
  text-align: center;
}

.subscription-form {
  display: flex;
  margin: 0;
  padding: 0;
}

.email-input {
  padding: 10px 14px;
  margin: 0;
  background-color: transparent;
  border: 1px solid #444;
  margin-right: 8px;
  color: #FEFCF3;
  font-family: "Dosis", sans-serif;
  font-size: 0.95rem;
  font-weight: 200;
  width: 240px;
  outline: none;
  transition: border-color 0.2s ease;
}

.email-input::placeholder {
  color: #666;
}

.email-input:focus {
  border-color: #FEFCF3;
}

.submit-button {
  padding: 10px 20px;
  margin: 0;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #444;
  font-family: "Dosis", sans-serif;
  font-size: 0.95rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.submit-button:hover {
  background-color: #FEFCF3;
  color: black;
  border-color: #FEFCF3;
}

.subscribed-msg {
  font-family: "Dosis", sans-serif;
  font-size: 0.95rem;
  font-weight: 200;
  color: #FEFCF3;
  margin: 0;
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-link {
  font-family: "Dosis", sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  color: #FEFCF3;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.footer-link:hover {
  opacity: 0.6;
}

.footer-ig {
  font-size: 1.3rem;
}

.footer-divider {
  color: #444;
}
</style>
