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

    try {
      if (authMode.value === 'session') {
        await getCsrfToken()
      }
      await registerUser(payload)
      if (authMode.value === 'jwt') {
        await loginWithJwt(payload.username, payload.password)
      } else {
        await loginWithSession(payload.username, payload.password)
      }
      closeModal()
    } catch (error) {
      errorMessage.value = toErrorMessage(error)
    } finally {
      isLoading.value = false
    }
  }

  async function login(payload: { identifier: string; password: string }) {
    isLoading.value = true
    errorMessage.value = null

    try {
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
