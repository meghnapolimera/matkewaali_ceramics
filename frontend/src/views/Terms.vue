<template>
  <div class="terms-page">
    <div class="terms-container">

      <section class="terms-section">
        <h2>Orders</h2>
        <p>All pieces are individually handmade and available in limited quantities. As each item is one of a kind, orders cannot be cancelled or modified once placed — so please take your time before checking out.</p>
      </section>

      <section class="terms-section">
        <h2>Handmade Nature of Work</h2>
        <p>Every piece is wheel-thrown by hand, so no two are exactly alike. Small variations in form, glaze, and finish are a natural part of the process and part of what makes each piece its own. Photographs are a close representation, but your piece may vary slightly in colour and texture.</p>
      </section>

      <section class="terms-section">
        <h2>Returns & Exchanges</h2>
        <p>Because each piece is made to order and one of a kind, I'm not able to offer returns or exchanges. That said, if something arrives damaged, please reach out within 48 hours of delivery with a photo and I'll do my best to make it right.</p>
      </section>

      <section class="terms-section">
        <h2>Shipping</h2>
        <p>I currently ship within the United States only. Every order is packed with care to keep it safe on its way to you. Once it's with the carrier, I'm unfortunately not able to take responsibility for any delays or losses, but I'm happy to help where I can. Shipping costs are calculated at checkout.</p>
      </section>

      <section class="terms-section">
        <h2>Care</h2>
        <p>All pieces are food and dishwasher safe, though hand washing is strongly recommended to keep them looking their best for longer. Try to avoid sudden changes in temperature.</p>
      </section>

      <section class="terms-section">
        <h2>Payment</h2>
        <p>Payment is processed securely via Square. All major credit and debit cards are accepted. Prices are in USD and sales tax is applied where applicable.</p>
      </section>

      <section class="terms-section">
        <h2>Questions</h2>
        <p>If anything here is unclear or you'd like to know more, feel free to <router-link to="/contact" class="terms-link">get in touch</router-link> — I'm always happy to help.</p>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.terms-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 40px 36px 60px;
}

.terms-container {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.terms-section h2 {
  font-family: "Dosis", sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 12px;
}

.terms-section p {
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 200;
  color: #FEFCF3;
  line-height: 1.75;
  margin: 0;
  text-align: justify;
}

.terms-link {
  color: #FEFCF3;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.terms-link:hover {
  opacity: 0.7;
}
</style>
