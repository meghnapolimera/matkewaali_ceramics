<template>
  <div class="contact">
    <p>Reach out to me at meghnapolimera@matkewaali.com if you have any questions about</p>
    <ul>
      <li>bulk orders</li>
      <li>custom orders that are inspired by my work</li>
    </ul>
    <br>
    <br>
    <p>You can also find my latest work on instagram <a class="link" href="https://www.instagram.com/matkewaali/">@matkewaali</a></p>
    <!-- <form @submit.prevent="handleSubmit">
      <label for="name">Name</label>
      <input type="text" id="name" v-model="name" required />

      <label for="email">Email</label>
      <input type="email" id="email" v-model="email" required />

      <label for="message">Message</label>
      <textarea id="message" v-model="message" required></textarea>

      <button type="submit">Send</button>
    </form> -->
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
.contact {
  padding: 5em;
  background-color: black;
  color: #FEFCF3;
  font-size: 20px;
}

p {
 font-size: 12px;
 letter-spacing: 1.5px;
}

ul {
  list-style-type: disc; /* Default bullet style */
  padding-left: 20px; /* Add space between the bullet and text */
}

li {
  margin-top: 10px; /* Space between list items */
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-top: 1em;
}

input, textarea {
  margin-top: 0.5em;
  padding: 0.5em;
  background-color: black;
  border-style: solid;
  border-width: 0.2px;
  outline: none;
  border-color: #FEFCF3;
  color: #FEFCF3;
}

button {
  padding: 10px 20px;
  color: #FEFCF3;
  background-color: black;
  color: #FEFCF3;
  cursor: pointer;
  margin-top: 20px;
  width: auto;
  box-shadow: none;
  border-style: solid;
  border-width: 1px;
}

.link {
  color: #FEFCF3;
}

/* Mobile styles */
@media (max-width: 768px) {
  .contact {
    font-size: 12px;
  }
}

</style>
