<template>
  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
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
</style>