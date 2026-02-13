<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import TypingIndicator from './TypingIndicator.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const inputText = ref('')
const messagesContainer = ref<HTMLElement>()

const messages = computed(() => chatStore.currentMessages)

function scrollToBottom() {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value?.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth',
      })
    })
  }
}

function handleStop() {
  chatStore.stopGeneration()
}

async function handleSendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  const isAuthenticated = authStore.isAuthenticated

  if (!isAuthenticated && !chatStore.canGuestPost()) {
    authStore.openModal()
    return
  }

  inputText.value = ''
  await nextTick()
  scrollToBottom()

  try {
    await chatStore.sendMessage(text, isAuthenticated)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error)
    scrollToBottom()
  }
}

// Watcher pour scroll automatique lors du changement de messages
watch(
  messages,
  () => {
    nextTick(() => scrollToBottom())
  },
  { deep: true, immediate: true },
)
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
      <span class="font-semibold text-base text-gray-100">{{
        chatStore.currentChat?.title || 'Nouveau chat'
      }}</span>
      <button class="p-2 -mr-2 text-gray-300 hover:bg-white/10 rounded-lg" type="button">
        <span class="iconify hugeicons--add-01"></span>
      </button>
    </header>

    <!-- Login button for unauthenticated users -->
    <div
      v-if="!authStore.isAuthenticated"
      class="absolute top-4 right-4 z-40 hidden md:block"
    >
      <button
        @click="authStore.openModal"
        class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl transition-colors shadow-lg"
        type="button"
      >
        <span class="iconify hugeicons--user-circle text-lg"></span>
        <span class="text-sm font-semibold">Se connecter</span>
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scroll-smooth">
      <div class="max-w-3xl mx-auto w-full px-4 md:px-6 pt-10 pb-48">
        <div class="space-y-10">
          <MessageBubble
            v-for="message in messages"
            :key="message.id"
            :message="message"
          />
          <TypingIndicator v-model:is-typing="chatStore.isTyping" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <div
      class="absolute bottom-0 left-0 w-full bg-linear-to-t from-background-dark via-background-dark to-transparent pb-8 pt-10 px-4 pointer-events-none"
    >
      <div class="max-w-3xl mx-auto w-full pointer-events-auto">
        <ChatInput v-model="inputText" :is-loading="chatStore.isTyping" @send="handleSendMessage" @stop="handleStop" />
        <div class="flex items-center justify-center gap-4 mt-3">
          <p class="hidden text-center text-xs text-gray-600">
            L'IA peut faire des erreurs. Vérifiez les informations importantes.
          </p>
          <p
            v-if="!authStore.isAuthenticated"
            class="text-xs font-semibold text-primary-300 bg-primary/10 px-2 py-1 rounded-full border border-primary/20"
          >
            {{ chatStore.getGuestPostCount() }}/5 essais
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
