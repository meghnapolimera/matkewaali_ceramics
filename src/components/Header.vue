<template>
  <header>
    <div class="logo">
      <router-link to="/">
        <img src="@/assets/matkewaali_ceramics_white_logo.png" />
      </router-link>
    </div>
    <div class="menu-container">
      <a href="https://www.instagram.com/matkewaali/" target="_blank" class="social-icon">
        <i class="fab fa-instagram"></i>
      </a>
      <div class="hamburger" @click="toggleMenu">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
      <nav :class="{ 'nav-active': isMenuOpen }">
        <router-link to="/" @click="closeMenu">Home</router-link>
        <router-link to="/contact" @click="closeMenu">Contact</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import matkewaali_ceramics_white_logo from '@/assets/matkewaali_ceramics_white_logo.png'; // Adjust the path based on your project structure

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2em; /* Reduced padding */
  background-color: black;
  color: #FEFCF3;
  position: relative; /* Ensure header is positioned correctly */
  z-index: 1000; /* Make sure header stays on top */
  height: 20vh;
}

.logo img {
  height: 150px; /* Reduced logo size */
  font-size: 30px;
  display: block;
}

.menu-container {
  display: flex;
  align-items: center;
}

.social-icon {
  margin-right: 0;
  color: #FEFCF3;
  font-size: 1.2em; /* Smaller Instagram icon */
}

.hamburger {
  display: none; /* Hide by default, show on mobile */
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  height: 15px; /* Reduced height */
  width: 15px; /* Reduced width */
}

.bar {
  height: 1px; /* Thinner bars */
  width: 15px; /* Match width of hamburger */
  background-color: #FEFCF3;
  border-radius: 2px; /* Rounded corners */
}

nav {
  display: flex;
  align-items: center;
}

nav a, nav router-link {
  text-decoration: none;
  margin-left: 1em;
  color: #FEFCF3;
}

/* Mobile styles */
@media (max-width: 768px) {
  .header {
    height: 10vh;
    padding-left: 10px;
    padding-right: 10px;
  }
  
  .logo img {
    height: 100px; /* Reduced logo size */
    font-size: 20px;
  }

  .hamburger {
    display: flex;
  }

  nav {
    display: flex;
    flex-direction: column;
    position: fixed; /* Make menu fixed so it doesn’t overlap content */
    top: 20vh; /* Adjust based on header height */
    right: 0;
    background-color: black;
    width: 100%;
    height: calc(100vh - 15vh); /* Adjust based on header height */
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 999; /* Ensure menu is above content */
    padding-top: 10em; /* Add padding for content alignment */
  }

  .nav-active {
    transform: translateX(0);
  }

  nav a, nav router-link {
    margin: 1em 0;
    text-align: center;
  }

  .social-icon {
  margin-right: 1em;
}
}

/* Adjust the main content */
main {
  padding-top: 15vh; /* Ensure content starts below the header */
}
</style>


