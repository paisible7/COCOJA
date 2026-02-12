export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  name: string
  initials: string
  plan: string
}
