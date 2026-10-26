import axios from 'axios'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation, Message } from '@/types/chat'
import {
  fetchConversations,
  fetchConversation,
  createConversation,
  deleteConversation as apiDeleteConversation,
  updateConversation,
  sendMessageToAI,
  addMessageToConversation,
  updateMessage as apiUpdateMessage,
} from '@/services/api'
import type { ApiConversation, ApiMessage } from '@/services/api'

// ─── Helpers pour convertir les données API → front ───────────────

function apiMessageToMessage(m: ApiMessage): Message {
  return {
    id: m.id,
    role: m.role,
    text: m.content,
    timestamp: m.created_at,
  }
}

function apiConversationToConversation(c: ApiConversation): Conversation {
  return {
    id: c.id,
    title: c.title,
    messages: c.messages ? c.messages.map(apiMessageToMessage) : [],
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    messageCount: c.message_count,
    lastMessage: c.last_message,
    pinned: false,
  }
}

export const useChatStore = defineStore('chat', () => {
  // État
  const conversations = ref<Conversation[]>([])
  const currentChatId = ref<number | string | null>(null)
  const isTyping = ref(false)
  const isLoadingConversations = ref(false)
  const guestPostCount = ref(0)
  const sidebarCollapsed = ref(false)
  const selectedModel = ref('axiom-default')
  let abortController: AbortController | null = null

  // Conversations guest (en mémoire, pas de persistence)
  const guestMessages = ref<Message[]>([])

  // Available AI models
  const availableModels = ref([
    { id: 'axiom-default', name: 'Axiom', description: 'Modèle par défaut', icon: 'hugeicons--ai-chat-02' },
    { id: 'axiom-fast', name: 'Axiom Fast', description: 'Réponses rapides', icon: 'hugeicons--rocket-01' },
    { id: 'axiom-pro', name: 'Axiom Pro', description: 'Plus précis et détaillé', icon: 'hugeicons--stars' },
  ])
  // Computed
  const currentChat = computed(() => {
    return conversations.value.find((c) => c.id === currentChatId.value)
  })

  const currentMessages = computed(() => {
    if (currentChat.value) {
      return currentChat.value.messages
    }
    return guestMessages.value
  })

  const groupedConversations = computed(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const groups: Record<string, Conversation[]> = {
      "Aujourd'hui": [],
      Hier: [],
      '7 derniers jours': [],
      'Plus ancien': [],
    }

    conversations.value.filter(c => !c.pinned).forEach((chat) => {
      const chatDate = new Date(chat.updatedAt)
      const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate())

      if (chatDay.getTime() === today.getTime()) {
        groups["Aujourd'hui"]!.push(chat)
      } else if (chatDay.getTime() === yesterday.getTime()) {
        groups.Hier!.push(chat)
      } else if (chatDate >= weekAgo) {
        groups['7 derniers jours']!.push(chat)
      } else {
        groups['Plus ancien']!.push(chat)
      }
    })

    // Supprimer les groupes vides
    Object.keys(groups).forEach((key) => {
      if (groups[key]!.length === 0) {
        delete groups[key]
      }
    })

    return groups
  })

  const pinnedConversations = computed(() => {
    return conversations.value.filter(c => c.pinned)
  })

  // ─── Actions pour utilisateurs authentifiés ───────────────────

  async function loadConversations() {
    isLoadingConversations.value = true
    try {
      const apiConversations = await fetchConversations()
      conversations.value = apiConversations.map(apiConversationToConversation)

      // Sélectionner la première conversation si aucune n'est active
      if (!currentChatId.value && conversations.value.length > 0) {
        currentChatId.value = conversations.value[0]!.id
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error)
    } finally {
      isLoadingConversations.value = false
    }
  }

  async function loadConversationMessages(conversationId: number) {
    try {
      const apiConv = await fetchConversation(conversationId)
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv && apiConv.messages) {
        conv.messages = apiConv.messages.map(apiMessageToMessage)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  async function createNewChat() {
    try {
      const apiConv = await createConversation()
      const conv = apiConversationToConversation(apiConv)
      conversations.value.unshift(conv)
      currentChatId.value = conv.id
      return conv
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
      throw error
    }
  }

  function createGuestChat() {
    // Pour les invités, on utilise un chat en mémoire
    guestMessages.value = []
    currentChatId.value = null
  }

  async function switchToChat(chatId: number | string) {
    currentChatId.value = chatId
    // Charger les messages si pas déjà chargés
    const conv = conversations.value.find((c) => c.id === chatId)
    if (conv && conv.messages.length === 0 && typeof chatId === 'number') {
      await loadConversationMessages(chatId)
    }
  }

  async function deleteChat(chatId: number | string) {
    if (typeof chatId === 'number') {
      await apiDeleteConversation(chatId)
    }
    conversations.value = conversations.value.filter((c) => c.id !== chatId)

    if (currentChatId.value === chatId) {
      currentChatId.value = conversations.value[0]?.id || null
    }
  }

  async function updateChatTitle(chatId: number | string, title: string) {
    const chat = conversations.value.find((c) => c.id === chatId)
    if (chat) {
      chat.title = title
      if (typeof chatId === 'number') {
        await updateConversation(chatId, { title })
      }
    }
  }

  // ─── Envoi de messages ────────────────────────────────────────

  async function sendMessage(text: string, isAuthenticated: boolean): Promise<void> {
    if (isAuthenticated) {
      await sendAuthenticatedMessage(text)
    } else {
      await sendGuestMessage(text)
    }
  }

  async function sendAuthenticatedMessage(text: string) {
    // Créer une conversation si aucune n'est active
    if (!currentChatId.value) {
      await createNewChat()
    }

    const conversationId = currentChatId.value as number
    const chat = currentChat.value
    if (!chat) throw new Error('No current chat')

    // Ajouter le message utilisateur côté client immédiatement
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    }
    chat.messages.push(userMsg)
    chat.updatedAt = new Date().toISOString()

    // Mettre à jour le titre si c'est le premier message
    if (chat.messages.length === 1) {
      const title = text.substring(0, 50) + (text.length > 50 ? '...' : '')
      chat.title = title
      updateConversation(conversationId, { title }).catch(() => {})
    }

    // Sauvegarder le message utilisateur en DB
    addMessageToConversation(conversationId, { role: 'user', content: text }).then((saved) => {
      userMsg.id = saved.id
    }).catch(console.error)

    // Envoyer à l'IA
    isTyping.value = true
    abortController = new AbortController()
    try {
      const aiResponse = await sendMessageToAI(text, conversationId, {
        signal: abortController.signal,
      }, selectedModel.value)
      isTyping.value = false
      abortController = null

      // Ajouter la réponse côté client
      const assistantMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'assistant',
        text: aiResponse,
        timestamp: new Date().toISOString(),
      }
      chat.messages.push(assistantMsg)
      chat.updatedAt = new Date().toISOString()

      // Remonter la conversation en haut de la liste
      const idx = conversations.value.findIndex((c) => c.id === conversationId)
      if (idx > 0) {
        const [conv] = conversations.value.splice(idx, 1)
        conversations.value.unshift(conv!)
      }
    } catch (error) {
      isTyping.value = false
      abortController = null
      if (axios.isCancel(error)) return
      const errorMsg: Message = {
        id: `temp-${Date.now()}`,
        role: 'assistant',
        text: "Désolé, une erreur s'est produite lors de la communication avec le serveur.",
        timestamp: new Date().toISOString(),
        isError: true,
      }
      chat.messages.push(errorMsg)
      throw error
    }
  }

  async function sendGuestMessage(text: string) {
    // Message utilisateur (en mémoire uniquement)
    const userMsg: Message = {
      id: `guest-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    }
    guestMessages.value.push(userMsg)

    guestPostCount.value++

    // Envoyer à l'IA
    isTyping.value = true
    abortController = new AbortController()
    try {
      const aiResponse = await sendMessageToAI(text, undefined, {
        signal: abortController.signal,
      }, selectedModel.value)
      isTyping.value = false
      abortController = null

      const assistantMsg: Message = {
        id: `guest-${Date.now()}`,
        role: 'assistant',
        text: aiResponse,
        timestamp: new Date().toISOString(),
      }
      guestMessages.value.push(assistantMsg)
    } catch (error) {
      isTyping.value = false
      abortController = null
      if (axios.isCancel(error)) return
      const errorMsg: Message = {
        id: `guest-${Date.now()}`,
        role: 'assistant',
        text: "Tu dois te connecter pour utiliser l'IA.",
        timestamp: new Date().toISOString(),
        isError: true,
      }
      guestMessages.value.push(errorMsg)
      throw error
    }
  }

  // ─── Guest ────────────────────────────────────────────────────

  function canGuestPost(): boolean {
    return guestPostCount.value < 5
  }

  function getGuestPostCount(): number {
    return guestPostCount.value
  }

  function stopGeneration() {
    if (abortController) {
      abortController.abort()
      abortController = null
      isTyping.value = false
    }
  }

  // ─── Init / Reset ─────────────────────────────────────────────

  async function initForUser() {
    await loadConversations()
  }

  function resetForGuest() {
    conversations.value = []
    currentChatId.value = null
    guestMessages.value = []
    guestPostCount.value = 0
  }

  // ─── Edit messages ────────────────────────────────────────────

  async function editMessageAction(messageId: string | number, newText: string) {
    const chat = currentChat.value
    const msgs = chat ? chat.messages : guestMessages.value
    const msg = msgs.find(m => m.id === messageId)
    if (msg) {
      msg.text = newText
      if (typeof messageId === 'number') {
        try { await apiUpdateMessage(messageId, { content: newText }) } catch (e) { console.error(e) }
      }
    }
  }

  // ─── Retry last message ──────────────────────────────────────

  async function retryLastMessage(isAuthenticated: boolean) {
    const msgs = currentChat.value ? currentChat.value.messages : guestMessages.value
    // Remove last error message
    if (msgs.length > 0 && msgs[msgs.length - 1]!.role === 'assistant') {
      msgs.pop()
    }
    // Find last user message and resend
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i]!.role === 'user') {
        await sendMessage(msgs[i]!.text, isAuthenticated)
        return
      }
    }
  }

  // ─── Pin / Unpin conversation ─────────────────────────────────

  function togglePinConversation(chatId: number | string) {
    const chat = conversations.value.find(c => c.id === chatId)
    if (chat) {
      chat.pinned = !chat.pinned
    }
  }

  // ─── Sidebar collapse ────────────────────────────────────────

  function toggleSidebarCollapse() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // ─── Export conversation ──────────────────────────────────────

  function exportConversation(format: 'markdown' | 'txt') {
    const msgs = currentChat.value ? currentChat.value.messages : guestMessages.value
    const title = currentChat.value?.title || 'Conversation'
    let content = ''

    if (format === 'markdown') {
      content = `# ${title}\n\n`
      msgs.forEach(m => {
        const label = m.role === 'user' ? '**Vous**' : '**Axiom**'
        content += `${label}\n\n${m.text}\n\n---\n\n`
      })
    } else {
      content = `${title}\n${'='.repeat(title.length)}\n\n`
      msgs.forEach(m => {
        const label = m.role === 'user' ? 'Vous' : 'Axiom'
        content += `[${label}]\n${m.text}\n\n`
      })
    }

    const ext = format === 'markdown' ? 'md' : 'txt'
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-zA-Z0-9\u00C0-\u024F ]/g, '_').substring(0, 50)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Model selection ──────────────────────────────────────────

  function setModel(modelId: string) {
    selectedModel.value = modelId
  }

  return {
    // État
    conversations,
    currentChatId,
    currentChat,
    currentMessages,
    isTyping,
    isLoadingConversations,
    groupedConversations,
    pinnedConversations,
    sidebarCollapsed,
    selectedModel,
    availableModels,
    // Actions
    createNewChat,
    createGuestChat,
    switchToChat,
    deleteChat,
    updateChatTitle,
    sendMessage,
    stopGeneration,
    canGuestPost,
    getGuestPostCount,
    initForUser,
    resetForGuest,
    loadConversationMessages,
    editMessageAction,
    retryLastMessage,
    togglePinConversation,
    toggleSidebarCollapse,
    exportConversation,
    setModel,
  }
})
