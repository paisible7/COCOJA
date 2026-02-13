export interface Message {
  id: string | number
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  isError?: boolean
  model?: string
}

export interface Conversation {
  id: string | number
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
  messageCount?: number
  pinned?: boolean
  lastMessage?: {
    role: string
    content: string
    created_at: string
  } | null
}

export interface UserProfile {
  name: string
  initials: string
  plan: string
}

export interface AIModel {
  id: string
  name: string
  description: string
  icon: string
}
