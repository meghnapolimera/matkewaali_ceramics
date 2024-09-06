<template>
  <footer class="footer">
    <div class="footer-content">
      <p v-if="!subscribed" class="footer-text">Subscribe here for updates</p>
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
      <p v-if="subscribed" class="subscription-message">You are subscribed!</p>
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      subscribed: false
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwmg-hLGkfV0GZyDdHjyZZFNRrpTJM2M6xuN5Koa9fVpoyFkMN0I3Mm7cClg8LHrOXQZg/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            email: this.email
          })
        });

        if (response.ok) {
          this.subscribed = true;
          this.email = ''; // Clear the input after submission
        } else {
          alert('There was a problem with your submission.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('There was a problem with your submission.');
      }
    }
  }
};
</script>

<style scoped>
.footer {
  background-color: black;
  color: #FEFCF3;
  padding-top: 5vh;
  text-align: center;
  height: 15vh;
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.footer-text {
  margin-bottom: 20px;
}

.subscription-form {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.email-input {
  padding: 10px;
  border: none;
  width: 250px;
  background-color: #FEFCF3;
  border-style: none;
  outline: none;
}

.submit-button {
  padding: 10px 20px;
  color: #FEFCF3;
  background-color: black;
  cursor: pointer;
  border-style: solid;
  border-width: 1px;
}

.subscription-message {
  color: #FEFCF3;
  font-size: 1em;
  margin-top: 20px;
}

/* Mobile styles */
@media (max-width: 768px) {
  .footer {
    height: 20vh;
  }
  .subscription-form {
    border-radius: 0%;
}

.email-input {
  border-radius: 0%;
}

.submit-button {
  border-radius: 0%;
}
}
</style>
