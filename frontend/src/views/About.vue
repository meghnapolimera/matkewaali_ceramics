<template>
  <div class="about-page">
    <div class="about-container">
      <div class="about-content">
        <p>I am Meghna Polimera, and my journey with clay began in 2019 through self-directed exploration. As a self-taught ceramic artist, I create functional wheel-thrown pieces that emphasize rustic aesthetics through varied textures and muted tones.</p>

        <p>My work explores the natural qualities of clay and surface, combining techniques like hand-texturing, carving, and slip trailing to create pieces with tactile depth and organic character. I favor earthy palettes and raw finishes that bring a sense of warmth and authenticity to everyday objects.</p>

        <p>I also draw inspiration from Indian folk and tribal art traditions—including Warli, Gond, Sohrai, Kolam, Bandhani, and Kalamkari. These traditions, which have carried stories of communities for generations through bold geometries and nature-inspired motifs, translate beautifully onto ceramic surfaces. Through slip trailing and pattern work, I honor these visual languages while creating pieces that bridge ancestral patterns with contemporary functional design.</p>

        <p>Being self-taught has shaped my approach through intuitive exploration and deliberate practice, leading to a style that feels both personal and connected to larger artistic traditions.</p>

        <p>You can also find my latest work on instagram <a href="https://instagram.com/matkewaali" target="_blank" rel="noopener noreferrer" class="instagram-link">@matkewaali</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 40px 30px;
}

.about-container {
  max-width: 800px;
  margin: 0 auto;
}

.about-content {
  font-family: "Dosis", sans-serif;
  color: #FEFCF3;
  font-weight: 200;
}

.about-content p {
  font-size: 1.125rem;
  line-height: 1.7;
  text-align: justify;
  margin-bottom: 24px;
}

.about-content p:last-child {
  margin-bottom: 0;
}

.instagram-link {
  color: #FEFCF3;
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.instagram-link:hover {
  opacity: 0.7;
}

/* Tablet optimizations */
@media (min-width: 600px) {
  .about-content p {
    font-size: 1.1875rem;
  }
}

/* Desktop optimizations */
@media (min-width: 768px) {
  .about-page {
    padding: 60px 40px;
  }
}
</style>
