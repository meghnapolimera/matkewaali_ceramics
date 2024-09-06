<template>
  <div class="home">
    <div class="background-image"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.background-image {
  background-image: url('../assets/cow_madhubani_background.jpeg');
  background-size: contain;
  background-position: center; /* Centers the image */
  background-repeat: no-repeat; /* Prevents repeating the image */
  width: 100%; /* Ensures the container covers the full viewport width */
  height: 100%; /* Ensures the container covers the full viewport height */
  background-color: black;
}

/* Mobile styles */
@media (max-width: 768px) {
}
</style>
