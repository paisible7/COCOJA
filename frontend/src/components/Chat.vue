<template>
  <div class="chat-container">
    <div class="messages">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <strong>{{ msg.user }}:</strong> {{ msg.text }}
      </div>
    </div>
    <input
      v-model="input"
      @keyup.enter="sendMessage"
      placeholder="Écris quelque chose..."
    />
    <button @click="sendMessage">Envoyer</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      input: '',
      messages: []
    }
  },
  methods: {
    async sendMessage() {
      if (!this.input) return

      // Ajouter le message de l'utilisateur
      this.messages.push({ user: 'Vous', text: this.input })

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/chat/ask/', {
          question: this.input
        })
        this.messages.push({ user: 'Bot', text: res.data.answer })
      } catch (err) {
        this.messages.push({ user: 'Bot', text: 'Erreur API' })
      }

      this.input = ''
    }
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 500px;
  margin: 2rem auto;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}
.messages {
  height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border: 1px solid #eee;
  padding: 0.5rem;
}
.message {
  margin-bottom: 0.5rem;
}
input {
  width: calc(100% - 80px);
  padding: 0.5rem;
}
button {
  width: 60px;
}
</style>
