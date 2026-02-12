<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { sendMessageToAI } from '@/services/api'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import TypingIndicator from './TypingIndicator.vue'

const chatStore = useChatStore()
const inputText = ref('')
const messagesContainer = ref<HTMLElement>()
const isTyping = ref(false)

const currentChat = computed(() => chatStore.currentChat)

function scrollToBottom() {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value?.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    })
  }
}

async function handleSendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  // Ajouter le message utilisateur
  chatStore.addMessage(text, 'user')
  inputText.value = ''

  await nextTick()
  scrollToBottom()

  // Afficher l'indicateur de frappe
  isTyping.value = true
  scrollToBottom()

  try {
    // Envoyer à l'API Django
    const aiResponse = await sendMessageToAI(text)

    isTyping.value = false
    chatStore.addMessage(aiResponse, 'assistant')

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    isTyping.value = false
    chatStore.addMessage(
      "Désolé, une erreur s'est produite lors de la communication avec le serveur.",
      'assistant'
    )
    scrollToBottom()
  }
}

// Watcher pour scroll automatique lors du changement de chat
watch(currentChat, () => {
  nextTick(() => scrollToBottom())
}, { immediate: true })
</script>

<template>
  <main class="flex-1 flex flex-col h-full relative bg-background-dark">
    <!-- Mobile header -->
    <header
      class="md:hidden flex items-center justify-between p-4 border-b border-border-dark bg-background-dark/95 backdrop-blur-md sticky top-0 z-30"
    >
      <button class="p-2 -ml-2 text-gray-300 hover:bg-white/10 rounded-lg" type="button">
        <span class="iconify hugeicons--menu-02"></span>
      </button>
      <span class="font-medium text-sm text-gray-200">{{ currentChat?.title || 'Nouveau chat' }}</span>
      <button class="p-2 -mr-2 text-gray-300 hover:bg-white/10 rounded-lg" type="button">
        <span class="iconify hugeicons--add-01"></span>
      </button>
    </header>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scroll-smooth">
      <div class="max-w-3xl mx-auto w-full px-4 md:px-6 pt-10 pb-48">
        <div class="space-y-10">
          <MessageBubble
            v-for="message in currentChat?.messages"
            :key="message.id"
            :message="message"
          />
          <TypingIndicator v-model:is-typing="isTyping" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <div
      class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background-dark via-background-dark to-transparent pb-8 pt-10 px-4 pointer-events-none"
    >
      <div class="max-w-3xl mx-auto w-full pointer-events-auto">
        <ChatInput v-model="inputText" @send="handleSendMessage" />
        <p class="text-center text-xs text-gray-600 mt-3">
          L'IA peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  </main>
</template>
