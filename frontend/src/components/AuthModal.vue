<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>('login')
const identifier = ref('')
const password = ref('')

const username = ref('')
const email = ref('')
const registerPassword = ref('')
const registerPasswordConfirm = ref('')

const canSubmitLogin = computed(() => Boolean(identifier.value.trim() && password.value.trim()))
const canSubmitRegister = computed(() =>
  Boolean(
    username.value.trim() &&
      email.value.trim() &&
      registerPassword.value.trim() &&
      registerPassword.value === registerPasswordConfirm.value,
  ),
)

function closeModal() {
  authStore.closeModal()
}

function switchTab(tab: 'login' | 'register') {
  activeTab.value = tab
}

async function handleLogin() {
  await authStore.login({ identifier: identifier.value, password: password.value })
}

async function handleRegister() {
  await authStore.register({
    username: username.value,
    email: email.value,
    password: registerPassword.value,
  })
}

watch(
  () => authStore.isModalOpen,
  (isOpen) => {
    if (!isOpen) {
      identifier.value = ''
      password.value = ''
      username.value = ''
      email.value = ''
      registerPassword.value = ''
      registerPasswordConfirm.value = ''
      activeTab.value = 'login'
    }
  },
)
</script>

<template>
  <teleport to="body">
    <div v-if="authStore.isModalOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative h-full flex items-center justify-center px-4">
        <div
          class="w-full max-w-md bg-surface-dark border border-border-dark rounded-2xl shadow-floating p-6 md:p-8"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.25em] font-medium text-gray-500">Compte</p>
              <h2 class="text-3xl font-bold text-gray-100 mt-1">Bienvenue</h2>
              <p class="text-sm text-gray-400 mt-1">Connecte-toi pour continuer.</p>
            </div>
            <button
              class="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5"
              type="button"
              @click="closeModal"
            >
              <span class="iconify hugeicons--cancel-01 text-lg"></span>
            </button>
          </div>

          <div class="mt-6 flex items-center gap-2 rounded-full bg-[#12151b] border border-border-dark p-1">
            <button
              class="flex-1 text-sm font-medium py-2 rounded-full transition-colors"
              :class="
                activeTab === 'login'
                  ? 'bg-primary/20 text-primary-200'
                  : 'text-gray-400 hover:text-gray-200'
              "
              type="button"
              @click="switchTab('login')"
            >
              Connexion
            </button>
            <button
              class="flex-1 text-sm font-medium py-2 rounded-full transition-colors"
              :class="
                activeTab === 'register'
                  ? 'bg-primary/20 text-primary-200'
                  : 'text-gray-400 hover:text-gray-200'
              "
              type="button"
              @click="switchTab('register')"
            >
              Inscription
            </button>
          </div>

          <div class="mt-6 flex items-center justify-between rounded-xl border border-border-dark bg-[#111419] px-4 py-3">
            <div>
              <p class="text-xs font-medium text-gray-500">Mode d'authentification</p>
              <p class="text-sm font-semibold text-gray-200">
                {{ authStore.authMode === 'session' ? 'Session' : 'JWT' }}
              </p>
            </div>
            <button
              class="text-xs uppercase tracking-wider text-primary-300 hover:text-primary"
              type="button"
              @click="
                authStore.setAuthMode(authStore.authMode === 'session' ? 'jwt' : 'session')
              "
            >
              Changer
            </button>
          </div>

          <p v-if="authStore.errorMessage" class="mt-4 text-sm text-red-400">
            {{ authStore.errorMessage }}
          </p>

          <form v-if="activeTab === 'login'" class="mt-4 space-y-4" @submit.prevent="handleLogin">
            <div>
              <label class="text-xs font-medium text-gray-500">Email ou pseudo</label>
              <input
                v-model="identifier"
                type="text"
                class="mt-2 w-full rounded-xl bg-[#0f1115] border border-border-dark px-4 py-3 text-sm text-gray-100 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="ton@email.com"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Mot de passe</label>
              <input
                v-model="password"
                type="password"
                class="mt-2 w-full rounded-xl bg-[#0f1115] border border-border-dark px-4 py-3 text-sm text-gray-100 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="••••••••"
              />
            </div>
            <button
              :disabled="!canSubmitLogin || authStore.isLoading"
              class="w-full py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
            >
              {{ authStore.isLoading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>

          <form
            v-else
            class="mt-4 space-y-4"
            @submit.prevent="handleRegister"
          >
            <div>
              <label class="text-xs font-medium text-gray-500">Pseudo</label>
              <input
                v-model="username"
                type="text"
                class="mt-2 w-full rounded-xl bg-[#0f1115] border border-border-dark px-4 py-3 text-sm text-gray-100 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="ton pseudo"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Email</label>
              <input
                v-model="email"
                type="email"
                class="mt-2 w-full rounded-xl bg-[#0f1115] border border-border-dark px-4 py-3 text-sm text-gray-100 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="ton@email.com"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Mot de passe</label>
              <input
                v-model="registerPassword"
                type="password"
                class="mt-2 w-full rounded-xl bg-[#0f1115] border border-border-dark px-4 py-3 text-sm text-gray-100 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500">Confirmer</label>
              <input
                v-model="registerPasswordConfirm"
                type="password"
                class="mt-2 w-full rounded-xl bg-[#0f1115] border border-border-dark px-4 py-3 text-sm text-gray-100 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="••••••••"
              />
            </div>
            <button
              :disabled="!canSubmitRegister || authStore.isLoading"
              class="w-full py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
            >
              {{ authStore.isLoading ? 'Creation...' : 'Creer un compte' }}
            </button>
          </form>

          <p class="mt-6 text-xs text-gray-500">
            En dev, le mode session utilise les cookies et le mode JWT utilise les tokens.
          </p>
        </div>
      </div>
    </div>
  </teleport>
</template>
