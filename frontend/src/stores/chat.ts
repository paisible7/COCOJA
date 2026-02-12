import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation, Message, UserProfile } from '@/types/chat'

const STORAGE_KEYS = {
  conversations: 'chatapp_conversations',
  currentChatId: 'chatapp_current_chat',
  userProfile: 'chatapp_user_profile',
}

const DEFAULT_USER: UserProfile = {
  name: 'Utilisateur',
  initials: 'U',
  plan: 'Plan Gratuit',
}

export const useChatStore = defineStore('chat', () => {
  // État
  const conversations = ref<Conversation[]>([])
  const currentChatId = ref<string | null>(null)
  const userProfile = ref<UserProfile>(DEFAULT_USER)
  const isTyping = ref(false)

  // Computed
  const currentChat = computed(() => {
    return conversations.value.find((c) => c.id === currentChatId.value)
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

    conversations.value.forEach((chat) => {
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

  // Actions
  function loadFromStorage() {
    try {
      const storedConversations = localStorage.getItem(STORAGE_KEYS.conversations)
      if (storedConversations) {
        conversations.value = JSON.parse(storedConversations)
      }

      const storedChatId = localStorage.getItem(STORAGE_KEYS.currentChatId)
      if (storedChatId) {
        currentChatId.value = storedChatId
      }

      const storedProfile = localStorage.getItem(STORAGE_KEYS.userProfile)
      if (storedProfile) {
        userProfile.value = JSON.parse(storedProfile)
      }
    } catch (error) {
      console.error('Error loading from storage:', error)
    }
  }

  function saveConversations() {
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations.value))
  }

  function saveCurrentChatId() {
    if (currentChatId.value) {
      localStorage.setItem(STORAGE_KEYS.currentChatId, currentChatId.value)
    }
  }

  function saveUserProfile() {
    localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(userProfile.value))
  }

  function createNewChat() {
    const newChat: Conversation = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    conversations.value.unshift(newChat)
    saveConversations()
    switchToChat(newChat.id)
  }

  function switchToChat(chatId: string) {
    currentChatId.value = chatId
    saveCurrentChatId()
  }

  function deleteChat(chatId: string) {
    conversations.value = conversations.value.filter((c) => c.id !== chatId)
    saveConversations()

    if (currentChatId.value === chatId) {
      currentChatId.value = conversations.value[0]?.id || null
      saveCurrentChatId()
    }
  }

  function updateChatTitle(chatId: string, title: string) {
    const chat = conversations.value.find((c) => c.id === chatId)
    if (chat) {
      chat.title = title
      chat.updatedAt = new Date().toISOString()
      saveConversations()
    }
  }

  function addMessage(text: string, role: 'user' | 'assistant' = 'user'): Message {
    if (!currentChatId.value) {
      createNewChat()
    }

    const chat = currentChat.value
    if (!chat) {
      throw new Error('No current chat')
    }

    const message: Message = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: new Date().toISOString(),
    }

    chat.messages.push(message)
    chat.updatedAt = new Date().toISOString()

    // Mettre à jour le titre avec le premier message
    if (chat.messages.length === 1 && role === 'user') {
      chat.title = text.substring(0, 50) + (text.length > 50 ? '...' : '')
    }

    saveConversations()
    return message
  }

  function updateUserProfile(profile: Partial<UserProfile>) {
    userProfile.value = { ...userProfile.value, ...profile }
    saveUserProfile()
  }

  // Initialiser au chargement du store
  loadFromStorage()

  return {
    // État
    conversations,
    currentChatId,
    currentChat,
    userProfile,
    isTyping,
    groupedConversations,
    // Actions
    createNewChat,
    switchToChat,
    deleteChat,
    updateChatTitle,
    addMessage,
    updateUserProfile,
    loadFromStorage,
  }
})
