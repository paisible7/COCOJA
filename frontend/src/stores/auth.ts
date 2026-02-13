import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchMe,
  getCsrfToken,
  loginJwt,
  loginSession,
  logoutSession,
  refreshJwt,
  registerUser,
  setAuthToken,
} from '@/services/api'

export type AuthMode = 'session' | 'jwt'

interface AuthUser {
  id: number
  username: string
  email: string
}

const STORAGE_KEYS = {
  mode: 'chatapp_auth_mode',
  access: 'chatapp_access_token',
  refresh: 'chatapp_refresh_token',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isModalOpen = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const authMode = ref<AuthMode>(
    (localStorage.getItem(STORAGE_KEYS.mode) as AuthMode) || 'session',
  )
  const accessToken = ref<string | null>(localStorage.getItem(STORAGE_KEYS.access))
  const refreshToken = ref<string | null>(localStorage.getItem(STORAGE_KEYS.refresh))

  const isAuthenticated = computed(() => Boolean(user.value))

  function openModal() {
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
    errorMessage.value = null
    successMessage.value = null
  }

  function setAuthMode(mode: AuthMode) {
    authMode.value = mode
    localStorage.setItem(STORAGE_KEYS.mode, mode)
    if (mode === 'session') {
      accessToken.value = null
      refreshToken.value = null
      localStorage.removeItem(STORAGE_KEYS.access)
      localStorage.removeItem(STORAGE_KEYS.refresh)
      setAuthToken(null)
    }
  }

  async function initAuth() {
    errorMessage.value = null

    if (authMode.value === 'jwt') {
      if (accessToken.value) {
        setAuthToken(accessToken.value)
      }

      try {
        user.value = await fetchMe()
        return
      } catch (_) {
        if (!refreshToken.value) {
          clearJwt()
          return
        }
      }

      try {
        const refreshed = await refreshJwt(refreshToken.value)
        accessToken.value = refreshed.access
        localStorage.setItem(STORAGE_KEYS.access, refreshed.access)
        setAuthToken(refreshed.access)
        user.value = await fetchMe()
      } catch (_) {
        clearJwt()
      }
    } else {
      try {
        user.value = await fetchMe()
      } catch (_) {
        user.value = null
      }
    }
  }

  async function register(payload: { username: string; email: string; password: string }) {
    isLoading.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      // Délai de dev pour simuler la latence
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      if (authMode.value === 'session') {
        await getCsrfToken()
      }
      await registerUser(payload)
      successMessage.value = 'Compte créé avec succès ! Connecte-toi maintenant.'
    } catch (error) {
      errorMessage.value = toErrorMessage(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function login(payload: { identifier: string; password: string }) {
    isLoading.value = true
    errorMessage.value = null

    try {
      // Délai de dev pour simuler la latence
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      if (authMode.value === 'jwt') {
        await loginWithJwt(payload.identifier, payload.password)
      } else {
        await loginWithSession(payload.identifier, payload.password)
      }
      closeModal()
    } catch (error) {
      errorMessage.value = toErrorMessage(error)
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithSession(identifier: string, password: string) {
    await getCsrfToken()
    user.value = await loginSession({ identifier, password })
  }

  async function loginWithJwt(identifier: string, password: string) {
    const tokens = await loginJwt({ identifier, password })
    accessToken.value = tokens.access
    refreshToken.value = tokens.refresh
    localStorage.setItem(STORAGE_KEYS.access, tokens.access)
    localStorage.setItem(STORAGE_KEYS.refresh, tokens.refresh)
    setAuthToken(tokens.access)
    user.value = await fetchMe()
  }

  async function logout() {
    errorMessage.value = null
    try {
      // Délai de dev pour simuler la latence
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      if (authMode.value === 'session') {
        await logoutSession()
      }
    } finally {
      user.value = null
      clearJwt()
    }
  }

  function clearJwt() {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem(STORAGE_KEYS.access)
    localStorage.removeItem(STORAGE_KEYS.refresh)
    setAuthToken(null)
  }

  function toErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      // Axios error with response
      if ('response' in error && error.response && typeof error.response === 'object') {
        const response = error.response as any
        if (response.data) {
          // Check for detail field (common in DRF)
          if (response.data.detail) {
            return response.data.detail
          }
          // Check for non_field_errors
          if (response.data.non_field_errors && Array.isArray(response.data.non_field_errors)) {
            return response.data.non_field_errors.join(' ')
          }
          // Collect all error messages from fields
          const messages: string[] = []
          for (const [field, value] of Object.entries(response.data)) {
            if (Array.isArray(value)) {
              messages.push(...value)
            } else if (typeof value === 'string') {
              messages.push(value)
            }
          }
          if (messages.length > 0) {
            return messages.join(' ')
          }
        }
      }
      // Check for message property
      if ('message' in error && typeof error.message === 'string') {
        return error.message
      }
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'Une erreur est survenue.'
  }

  return {
    user,
    isAuthenticated,
    isModalOpen,
    isLoading,
    errorMessage,
    successMessage,
    authMode,
    openModal,
    closeModal,
    setAuthMode,
    initAuth,
    register,
    login,
    logout,
  }
})
