<template>
  <div class="contact-page">
    <div class="contact-container">

      <div v-if="step === 'success'" class="status-message">
        <p>Message sent. I'll get back to you soon.</p>
        <router-link to="/products" class="action-btn">Back to Shop</router-link>
      </div>

      <div v-else class="contact-layout">
        <div class="contact-intro">
          <p>If you've got any questions about my work, custom orders, or anything else, please don't hesitate to get in touch. I'll try to get back to you as soon as possible.</p>
          <p>You can also find my latest work on Instagram at <a class="ig-link" href="https://www.instagram.com/matkewaali/" target="_blank">@matkewaali</a></p>
        </div>

        <form ref="formEl" class="contact-form" @submit.prevent="submit" novalidate>
          <label class="field">
            <span>Name <span class="required">*</span></span>
            <input v-model="form.name" type="text" maxlength="200" required :class="{ invalid: errors.name }" @blur="touch('name')" />
          </label>

          <label class="field">
            <span>Email <span class="required">*</span></span>
            <input v-model="form.email" type="email" maxlength="320" required :class="{ invalid: errors.email }" @blur="touch('email')" />
            <span v-if="errors.email && form.email.trim()" class="field-error">{{ errors.email }}</span>
          </label>

          <label class="field">
            <span>Message <span class="required">*</span></span>
            <textarea v-model="form.message" rows="6" maxlength="2000" required :class="{ invalid: errors.message }" @blur="touch('message')"></textarea>
            <span class="char-count">{{ form.message.length }} / 2000</span>
            <span v-if="errors.message && form.message.trim()" class="field-error">{{ errors.message }}</span>
          </label>

          <p v-if="submitError" class="field-error">{{ submitError }}</p>

          <button type="submit" class="submit-btn" :disabled="step === 'submitting'">
            <span v-if="step === 'submitting'" class="spinner"></span>
            <template v-else>Send Message</template>
          </button>
        </form>
      </div>

    </div>

    <div class="contact-images">
      <img src="@/assets/kolam_planter_1.png" alt="Kolam planter" class="contact-image" />
      <img src="@/assets/kolam_planter_2.png" alt="Kolam planter" class="contact-image" />
      <img src="@/assets/kolam_planter_3.png" alt="Kolam planter" class="contact-image" />
      <img src="@/assets/kolam_planter_4.png" alt="Kolam planter" class="contact-image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { api, ApiError } from '@/services/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const step = ref<'form' | 'submitting' | 'success'>('form')
const submitError = ref('')
const formEl = ref<HTMLFormElement | null>(null)

const form = reactive({ name: '', email: '', message: '' })
const errors = reactive({ name: '', email: '', message: '' })
const touched = reactive({ name: false, email: false, message: false })

function validate(): boolean {
  errors.name = !form.name.trim() ? 'Name is required' : ''
  errors.email = !form.email.trim()
    ? 'Email is required'
    : !EMAIL_RE.test(form.email)
      ? 'Please enter a valid email address'
      : ''
  errors.message = !form.message.trim()
    ? 'Message is required'
    : form.message.trim().length > 2000
      ? 'Message must be under 2000 characters'
      : ''
  return !errors.name && !errors.email && !errors.message
}

function touch(field: keyof typeof touched) {
  touched[field] = true
  validate()
}

async function submit() {
  touched.name = true
  touched.email = true
  touched.message = true
  if (!validate()) return

  step.value = 'submitting'
  submitError.value = ''

  try {
    await api.sendContact({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    })
    step.value = 'success'
  } catch (e) {
    submitError.value = e instanceof ApiError ? e.message : 'Something went wrong. Please try again.'
    step.value = 'form'
  }
}
</script>

<style scoped>
.contact-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 0 36px 60px;
}

.contact-container {
  max-width: 700px;
  margin: 0 auto;
}

.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 80px 20px;
  color: #FEFCF3;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  text-align: center;
}

.action-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 10px 28px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.action-btn:hover {
  background-color: #FEFCF3;
  color: black;
}

.contact-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-intro {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  color: #FEFCF3;
  line-height: 1.7;
  text-align: justify;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 32px;
}

.contact-intro p {
  margin: 0;
}

.ig-link {
  color: #FEFCF3;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ig-link:hover {
  opacity: 0.7;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  width: 100%;
}

.field span {
  font-family: "Dosis", sans-serif;
  font-size: 0.85rem;
  font-weight: 200;
  color: #FEFCF3;
  letter-spacing: 0.5px;
}

.field input,
.field textarea {
  background: transparent;
  border: 1px solid #333;
  color: #FEFCF3;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  border-color: #FEFCF3;
}

.field input.invalid,
.field textarea.invalid {
  border-color: #e57373;
}

.required {
  color: #e57373;
}

.char-count {
  font-family: "Dosis", sans-serif;
  font-size: 0.8rem;
  color: #777;
  text-align: right;
  margin-top: -2px;
}

.field-error {
  font-family: "Dosis", sans-serif;
  font-size: 0.85rem;
  font-weight: 200;
  color: #e57373;
  margin: 0;
}

.submit-btn {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1.5px;
  color: #FEFCF3;
  background-color: black;
  border: 1px solid #FEFCF3;
  padding: 10px 28px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #FEFCF3;
  color: black;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.spinner {
  display: block;
  width: 16px;
  height: 16px;
  border: 1px solid #666;
  border-top-color: #FEFCF3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; }
}

.contact-images {
  max-width: 700px;
  margin: 16px auto 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

@media (max-width: 768px) {
  .contact-images {
    max-width: 400px;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

.contact-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}
</style>
