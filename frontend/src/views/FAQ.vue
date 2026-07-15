<template>
  <div class="faq-page">
    <div class="faq-container">
      <div
        v-for="item in faqs"
        :key="item.q"
        class="faq-item"
        @click="toggle(item.q)"
      >
        <div class="faq-question">
          <span>{{ item.q }}</span>
          <span class="faq-icon">{{ open === item.q ? '−' : '+' }}</span>
        </div>
        <div v-show="open === item.q" class="faq-answer">
          <p>{{ item.a }}</p>
        </div>
      </div>

      <div class="faq-images">
        <img src="@/assets/block_printed_planters.jpeg" alt="Block printed planters" class="faq-image" />
        <img src="@/assets/cow_madhubani_planter.jpeg" alt="Cow madhubani planter" class="faq-image" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref<string | null>(null)

function toggle(q: string) {
  open.value = open.value === q ? null : q
}

const faqs = [
  {
    q: 'When do you update your shop?',
    a: 'New work is added a few times a year. There\'s no fixed schedule — it depends on what I\'m working on. Follow me on Instagram or subscribe to the newsletter to be the first to know when new pieces go live.',
  },
  {
    q: 'Do you take custom orders?',
    a: 'Yes! Feel free to get in touch through the contact form with details about what you have in mind.',
  },
{
    q: 'Do you ship internationally?',
    a: 'Currently I ship within the United States only. I hope to expand this in the future.',
  },
  {
    q: 'Do you have any care recommendations?',
    a: 'All pieces are food and dishwasher safe, but hand washing is strongly recommended. Handmade ceramics are more susceptible to chipping than mass-produced pieces, so a little extra care goes a long way.',
  },
  {
    q: 'Do you work with restaurants or coffee shops?',
    a: 'If you are interested in working together to develop pieces for your restaurant, please get in touch via the contact form explaining what type of tableware you are looking for and details about your restaurant. Please understand that I don\'t make anything that may fall outside of my usual aesthetic and work solely with my current glaze palette.',
  },
  {
    q: 'Do you work with retailers or galleries?',
    a: 'I\'m open to stockist inquiries on a case-by-case basis. Please reach out through the contact form with details about your space and I\'ll get back to you.',
  },
]
</script>

<style scoped>
.faq-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 0 36px 60px;
}

.faq-container {
  max-width: 700px;
  margin: 0 auto;
  padding-top: 32px;
}

.faq-item {
  border-bottom: 1px solid #222;
  cursor: pointer;
}

.faq-item:first-child {
  border-top: 1px solid #222;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  font-family: "Dosis", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: #FEFCF3;
  letter-spacing: 0.3px;
  gap: 16px;
}

.faq-icon {
  font-size: 1.2rem;
  font-weight: 200;
  color: #999;
  flex-shrink: 0;
}

.faq-answer {
  padding-bottom: 20px;
}

.faq-answer p {
  font-family: "Dosis", sans-serif;
  font-size: 0.95rem;
  font-weight: 200;
  color: #ccc;
  line-height: 1.75;
  margin: 0;
  text-align: justify;
}

.faq-images {
  display: flex;
  gap: 20px;
  margin-top: 48px;
}

.faq-image {
  width: calc(50% - 10px);
  height: auto;
}
</style>
