import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

// Délai de dev pour simuler la latence réseau (en ms)
const DEV_DELAY = 3000

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export async function sendMessageToAI(
  question: string,
  conversationId?: number,
  config?: AxiosRequestConfig,
): Promise<string> {
  try {
    const response = await api.post('/chat/ask/', { question, conversation_id: conversationId }, config)
    await delay(DEV_DELAY)
    return response.data.answer
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error
    }
    console.error('Error sending message to AI:', error)
    throw new Error("Erreur lors de la communication avec l'API")
  }
}

// ─── Conversations API ─────────────────────────────────────────────

export interface ApiConversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count: number
  last_message?: {
    role: string
    content: string
    created_at: string
  } | null
  messages?: ApiMessage[]
}

export interface ApiMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function fetchConversations(): Promise<ApiConversation[]> {
  const response = await api.get('/chat/conversations/')
  return response.data
}

export async function fetchConversation(id: number): Promise<ApiConversation> {
  const response = await api.get(`/chat/conversations/${id}/`)
  return response.data
}

export async function createConversation(title?: string): Promise<ApiConversation> {
  const response = await api.post('/chat/conversations/', {
    title: title || 'Nouvelle conversation',
  })
  return response.data
}

export async function deleteConversation(id: number): Promise<void> {
  await api.delete(`/chat/conversations/${id}/`)
}

export async function updateConversation(
  id: number,
  data: { title: string },
): Promise<ApiConversation> {
  const response = await api.patch(`/chat/conversations/${id}/`, data)
  return response.data
}

export async function addMessageToConversation(
  conversationId: number,
  data: { role: string; content: string },
): Promise<ApiMessage> {
  const response = await api.post(`/chat/conversations/${conversationId}/add_message/`, data)
  return response.data
}

export async function fetchConversationMessages(conversationId: number): Promise<ApiMessage[]> {
  const response = await api.get(`/chat/conversations/${conversationId}/messages/`)
  return response.data
}

export async function getCsrfToken(): Promise<void> {
  await api.get('/auth/csrf/')
}

export async function registerUser(payload: {
  username: string
  email: string
  password: string
}): Promise<{ id: number; username: string; email: string }> {
  const response = await api.post('/auth/register/', payload)
  return response.data
}

export async function loginSession(payload: {
  identifier: string
  password: string
}): Promise<{ id: number; username: string; email: string }> {
  const response = await api.post('/auth/login/', payload)
  return response.data
}

export async function logoutSession(): Promise<void> {
  await api.post('/auth/logout/')
}

export async function fetchMe(): Promise<{ id: number; username: string; email: string }> {
  const response = await api.get('/auth/me/')
  return response.data
}

export async function loginJwt(payload: {
  identifier: string
  password: string
}): Promise<{ access: string; refresh: string }> {
  const response = await api.post('/auth/jwt/create/', {
    username: payload.identifier,
    password: payload.password,
  })
  return response.data
}

export async function refreshJwt(refresh: string): Promise<{ access: string }> {
  const response = await api.post('/auth/jwt/refresh/', { refresh })
  return response.data
}
