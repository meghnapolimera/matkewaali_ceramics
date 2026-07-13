<template>
  <div class="print-cards">
    <div class="card" v-for="product in products" :key="product.id">
      <!-- Front side: Product Name + QR code -->
      <div class="card-front">
        <h2 class="product-name">{{ product.name.toUpperCase() }}</h2>
        <canvas :ref="el => setCanvasRef(product.id, el)" class="qr-code"></canvas>
      </div>

      <!-- Back side: Logo + Artist details -->
      <div class="card-back">
        <img :src="logoUrl" alt="Matkewaali Ceramics" class="logo" />
        <div class="contact-info">
          <p class="artist-name">Meghna Polimera</p>
          <p class="contact-detail">meghnapolimera@matkewaali.com</p>
          <p class="contact-detail">@matkewaali</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import productsData from '@/data/products.json'
import logoImage from '@/assets/matkewaali_ceramics_black_logo.png'

const products = ref(productsData)
const logoUrl = logoImage
const canvasRefs = ref<Record<string, HTMLCanvasElement | null>>({})

const setCanvasRef = (id: string, el: any) => {
  if (el) {
    canvasRefs.value[id] = el as HTMLCanvasElement
  }
}

onMounted(() => {
  products.value.forEach(product => {
    const canvas = canvasRefs.value[product.id]
    if (canvas) {
      const url = `https://www.matkewaali.com/products/${product.slug}`
      QRCode.toCanvas(canvas, url, {
        width: 95,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    }
  })
})
</script>

<style scoped>
/* Hide header and ensure white background */
:global(header) {
  display: none !important;
}

:global(body),
:global(html),
:global(#app) {
  background-color: white !important;
}

.print-cards {
  background-color: white !important;
  padding: 0.5in;
  display: grid;
  grid-template-columns: repeat(2, 2in);
  gap: 0.25in;
  justify-content: center;
}

.card {
  width: 2in;
  height: 3.5in;
  display: flex;
  flex-direction: column;
  background-color: white !important;
  border: 1px dashed #999;
  break-inside: avoid;
  page-break-inside: avoid;
}

.card-front,
.card-back {
  height: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.2in;
  box-sizing: border-box;
  background-color: white !important;
}

.card-front {
  border-bottom: 1px dashed #999;
}

.logo {
  width: 80%;
  max-height: 0.8in;
  object-fit: contain;
  margin-bottom: 0.1in;
  background-color: transparent !important;
}

.product-name {
  font-family: "Dosis", sans-serif;
  font-size: 9pt;
  font-weight: 400;
  color: #000000;
  text-align: center;
  line-height: 1.2;
  letter-spacing: 0.5px;
  background-color: transparent !important;
  margin-bottom: 0.15in;
}

.qr-code {
  display: block;
  background-color: transparent !important;
}

.contact-info {
  background-color: transparent !important;
  text-align: center;
}

.artist-name {
  font-family: "Dosis", sans-serif;
  font-size: 9pt;
  font-weight: 400;
  color: #000000;
  text-align: center;
  margin: 0 0 0.05in 0;
  background-color: transparent !important;
}

.contact-detail {
  font-family: "Dosis", sans-serif;
  font-size: 7pt;
  font-weight: 300;
  color: #000000;
  text-align: center;
  margin: 0.02in 0;
  background-color: transparent !important;
}

/* Print styles */
@media print {
  :global(header) {
    display: none !important;
  }

  .print-cards {
    padding: 0.25in;
  }

  .card {
    border: 1px solid #ccc;
    page-break-inside: avoid;
  }

  .card-front {
    border-bottom: 1px solid #ccc;
  }

  @page {
    size: letter portrait;
    margin: 0.25in;
  }
}
</style>
