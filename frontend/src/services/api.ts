import axios from 'axios'

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

export async function sendMessageToAI(question: string): Promise<string> {
  try {
    const response = await api.post('/chat/ask/', { question })
    return response.data.answer
  } catch (error) {
    console.error('Error sending message to AI:', error)
    throw new Error("Erreur lors de la communication avec l'API")
  }
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
