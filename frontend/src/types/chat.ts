export interface Message {
  id: string | number
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

export interface Conversation {
  id: string | number
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
  messageCount?: number
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
