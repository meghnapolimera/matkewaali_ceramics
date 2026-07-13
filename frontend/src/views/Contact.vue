<template>
  <div class="contact-page">
    <div class="contact-container">
      <div class="contact-content">
        <p>Reach out to me at meghnapolimera@matkewaali.com if you have any questions about</p>
        <ul>
          <li>bulk orders</li>
          <li>custom orders that are inspired by my work</li>
        </ul>

        <p>You can also find my latest work on instagram <a class="instagram-link" href="https://www.instagram.com/matkewaali/">@matkewaali</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import emailjs from 'emailjs-com';

const name = ref('');
const email = ref('');
const message = ref('');

const handleSubmit = () => {
  const templateParams = {
    from_name: name.value,
    from_email: email.value,
    message: message.value,
  };

  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
    .then((response) => {
      console.log('Success:', response);
      alert('Message sent successfully!');
      // Clear the form fields
      name.value = '';
      email.value = '';
      message.value = '';
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Failed to send the message. Please try again.');
    });
};
</script>

<style scoped>
.contact-page {
  min-height: calc(100vh - 20vh);
  background-color: black;
  padding: 40px 30px;
}

.contact-container {
  max-width: 800px;
  margin: 0 auto;
}

.contact-content {
  font-family: "Dosis", sans-serif;
  color: #FEFCF3;
  font-weight: 200;
}

.contact-content p {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

.contact-content p:last-child {
  margin-bottom: 0;
}

.contact-content ul {
  font-size: 1.125rem;
  line-height: 1.7;
  list-style-type: disc;
  padding-left: 40px;
  margin-bottom: 24px;
}

.contact-content li {
  margin-bottom: 12px;
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
  .contact-content p {
    font-size: 1.1875rem;
  }

  .contact-content ul {
    font-size: 1.1875rem;
  }
}

/* Desktop optimizations */
@media (min-width: 768px) {
  .contact-page {
    padding: 60px 40px;
  }
}
</style>
