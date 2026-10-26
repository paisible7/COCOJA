<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import TypingIndicator from './TypingIndicator.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const inputText = ref('')
const messagesContainer = ref<HTMLElement>()
const inputAreaRef = ref<HTMLElement>()
const inputAreaHeight = ref(0)

function updateInputHeight() {
  if (inputAreaRef.value) {
    inputAreaHeight.value = inputAreaRef.value.offsetHeight
  }
}

const bottomPadding = computed(() => `${inputAreaHeight.value + 16}px`)

const messages = computed(() => chatStore.currentMessages)
const showWelcome = computed(() => messages.value.length === 0 && !chatStore.isTyping)

// Find last assistant message index for regenerate button
const lastAssistantIndex = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i]!.role === 'assistant') return i
  }
  return -1
})

const emit = defineEmits<{
  toggleSidebar: []
}>()

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

async function handleSendMessage(text?: string) {
  const msgText = text || inputText.value.trim()
  if (!msgText) return

  const isAuthenticated = authStore.isAuthenticated

  if (!isAuthenticated && !chatStore.canGuestPost()) {
    authStore.openModal()
    return
  }

  inputText.value = ''
  await nextTick()
  scrollToBottom()

  try {
    await chatStore.sendMessage(msgText, isAuthenticated)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error)
    scrollToBottom()
  }
}

async function handleRegenerate() {
  // Find the last user message and resend it
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i]!.role === 'user') {
      const lastUserText = messages.value[i]!.text

      // Remove the last assistant message
      if (chatStore.currentChat) {
        const msgs = chatStore.currentChat.messages
        if (msgs.length > 0 && msgs[msgs.length - 1]!.role === 'assistant') {
          msgs.pop()
        }
      }

      // Resend
      try {
        await chatStore.sendMessage(lastUserText, authStore.isAuthenticated)
        await nextTick()
        scrollToBottom()
      } catch (error) {
        console.error('Erreur lors de la régénération:', error)
      }
      return
    }
  }
}

async function handleRetry() {
  try {
    await chatStore.retryLastMessage(authStore.isAuthenticated)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Erreur lors du retry:', error)
  }
}

function handleEditMessage(id: string | number, text: string) {
  chatStore.editMessageAction(id, text)
}

const showExportMenu = ref(false)

function handleExport(format: 'markdown' | 'txt') {
  chatStore.exportConversation(format)
  showExportMenu.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (showExportMenu.value && !target.closest('[data-export-menu]')) {
    showExportMenu.value = false
  }
}

async function handleNewMobileChat() {
  if (authStore.isAuthenticated) {
    await chatStore.createNewChat()
  } else {
    chatStore.createGuestChat()
  }
}

const suggestions = [
  { icon: 'hugeicons--idea-01', text: 'Explique-moi un concept' },
  { icon: 'hugeicons--code', text: 'Aide-moi à coder' },
  { icon: 'hugeicons--pencil-edit-01', text: "Rédige un texte pour moi" },
  { icon: 'hugeicons--analytics-01', text: 'Analyse des données' },
]

// Watcher pour scroll automatique lors du changement de messages
watch(
  messages,
  () => {
    nextTick(() => scrollToBottom())
  },
  { deep: true, immediate: true },
)

// Watch input text changes to recalculate input area height
watch(inputText, () => {
  nextTick(() => {
    updateInputHeight()
    scrollToBottom()
  })
})

onMounted(() => {
  nextTick(() => updateInputHeight())
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <main class="flex-1 flex flex-col h-full relative bg-background-dark">
    <!-- Mobile header -->
    <header
      class="md:hidden flex items-center justify-between p-4 border-b border-border-dark bg-background-dark/95 backdrop-blur-md sticky top-0 z-30"
    >
      <button
        class="p-2 -ml-2 text-gray-300 hover:bg-white/10 rounded-lg"
        type="button"
        @click="emit('toggleSidebar')"
      >
        <span class="iconify hugeicons--menu-02"></span>
      </button>
      <span class="font-semibold text-base text-gray-100 truncate max-w-50">{{
        chatStore.currentChat?.title || 'Nouveau chat'
      }}</span>
      <button
        class="p-2 -mr-2 text-gray-300 hover:bg-white/10 rounded-lg"
        type="button"
        @click="handleNewMobileChat"
      >
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

    <!-- Export button for desktop when messages exist -->
    <div
      v-if="messages.length > 0"
      class="absolute top-4 right-4 z-40 hidden md:block"
      :class="{ 'right-40': !authStore.isAuthenticated }"
    >
      <div class="relative" data-export-menu>
        <button
          @click="showExportMenu = !showExportMenu"
          class="flex items-center gap-2 px-3 py-2 bg-surface-dark hover:bg-surface-hover border border-border-dark text-gray-300 rounded-xl transition-colors"
          type="button"
          title="Exporter la conversation"
        >
          <span class="iconify hugeicons--download-04 text-lg"></span>
        </button>
        <transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="showExportMenu" class="absolute right-0 top-12 bg-surface-dark border border-border-dark rounded-xl shadow-floating overflow-hidden min-w-40 z-50">
            <button @click="handleExport('markdown')" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-hover transition-colors" type="button">
              <span class="iconify hugeicons--file-markdown text-base"></span>
              Markdown
            </button>
            <button @click="handleExport('txt')" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-hover transition-colors" type="button">
              <span class="iconify hugeicons--file-01 text-base"></span>
              Texte brut
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scroll-smooth">
      <div class="max-w-3xl mx-auto w-full px-4 md:px-6 pt-10" :style="{ paddingBottom: bottomPadding }">

        <!-- Welcome screen -->
        <div v-if="showWelcome" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div class="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
            <span class="iconify hugeicons--ai-chat-02 text-primary text-3xl"></span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-100 mb-2">Bienvenue sur Axiom</h1>
          <p class="text-gray-400 text-base md:text-lg mb-10 max-w-md">
            Comment puis-je vous aider aujourd'hui ?
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            <button
              v-for="(s, i) in suggestions"
              :key="i"
              @click="handleSendMessage(s.text)"
              class="flex items-center gap-3 px-4 py-3.5 bg-surface-dark border border-border-dark rounded-xl hover:border-primary/40 hover:bg-surface-hover transition-all text-left group"
              type="button"
            >
              <span :class="['iconify', s.icon, 'text-lg text-gray-500 group-hover:text-primary transition-colors']"></span>
              <span class="text-sm text-gray-300 group-hover:text-gray-100">{{ s.text }}</span>
            </button>
          </div>
        </div>

        <!-- Messages list -->
        <div v-else class="space-y-10">
          <MessageBubble
            v-for="(message, index) in messages"
            :key="message.id"
            :message="message"
            :is-last-assistant="index === lastAssistantIndex"
            @regenerate="handleRegenerate"
            @retry="handleRetry"
            @edit-message="handleEditMessage"
          />
          <TypingIndicator v-model:is-typing="chatStore.isTyping" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <div
      ref="inputAreaRef"
      class="absolute bottom-0 left-0 w-full bg-linear-to-t from-background-dark via-background-dark to-transparent pb-8 pt-10 px-4 pointer-events-none"
    >
      <div class="max-w-3xl mx-auto w-full pointer-events-auto">
        <ChatInput v-model="inputText" :is-loading="chatStore.isTyping" @send="handleSendMessage()" @stop="handleStop" />
        <div class="flex items-center justify-center gap-4 mt-3">
          <p class="text-center text-xs text-gray-600">
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
