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
  authStore.errorMessage = null
  authStore.successMessage = null
}

async function handleLogin() {
  await authStore.login({ identifier: identifier.value, password: password.value })
}

async function handleRegister() {
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: registerPassword.value,
    })
    // Basculer vers l'onglet de connexion après inscription réussie
    activeTab.value = 'login'
    // Pré-remplir l'identifiant avec le nom d'utilisateur
    identifier.value = username.value
    // Réinitialiser les champs d'inscription
    username.value = ''
    email.value = ''
    registerPassword.value = ''
    registerPasswordConfirm.value = ''
  } catch {
    // L'erreur est déjà gérée dans le store
  }
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
      authStore.errorMessage = null
      authStore.successMessage = null
    }
  },
)
</script>

<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="authStore.isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative h-full flex items-center justify-center px-4">
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="authStore.isModalOpen"
              class="w-full max-w-md bg-[#1a2028] border border-border-dark rounded-2xl shadow-floating p-6 md:p-8"
            >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.25em] font-medium text-gray-400">Compte</p>
              <h2 class="text-3xl font-bold text-white mt-1">Bienvenue</h2>
              <p class="text-sm text-gray-300 mt-1">Connecte-toi pour continuer.</p>
            </div>
            <button
              class="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
              type="button"
              @click="closeModal"
            >
              <span class="iconify hugeicons--cancel-01 text-lg"></span>
            </button>
          </div>

          <div class="mt-6 flex items-center gap-2 rounded-full bg-[#0f1318] border border-white/10 p-1">
            <button
              class="flex-1 text-sm font-medium py-2 rounded-full transition-colors"
              :class="
                activeTab === 'login'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
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
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              "
              type="button"
              @click="switchTab('register')"
            >
              Inscription
            </button>
          </div>

          <p v-if="authStore.errorMessage" class="mt-4 text-sm text-red-400">
            {{ authStore.errorMessage }}
          </p>
          <p v-if="authStore.successMessage" class="mt-4 text-sm text-green-400">
            {{ authStore.successMessage }}
          </p>

          <div class="overflow-hidden transition-all duration-300">
            <transition
              mode="out-in"
              enter-active-class="transition-all duration-250 ease-out delay-100"
              enter-from-class="opacity-0 translate-x-8"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-8"
            >
              <form v-if="activeTab === 'login'" key="login" class="mt-4 space-y-4" @submit.prevent="handleLogin">
            <div>
              <label class="text-xs font-medium text-gray-300">Email ou pseudo</label>
              <input
                v-model="identifier"
                type="text"
                class="mt-2 w-full rounded-xl bg-[#0f1318] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="ton@email.com"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-300">Mot de passe</label>
              <input
                v-model="password"
                type="password"
                class="mt-2 w-full rounded-xl bg-[#0f1318] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
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
            key="register"
            class="mt-4 space-y-4"
            @submit.prevent="handleRegister"
          >
            <div>
              <label class="text-xs font-medium text-gray-300">Pseudo</label>
              <input
                v-model="username"
                type="text"
                class="mt-2 w-full rounded-xl bg-[#0f1318] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="ton pseudo"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-300">Email</label>
              <input
                v-model="email"
                type="email"
                class="mt-2 w-full rounded-xl bg-[#0f1318] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="ton@email.com"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-300">Mot de passe</label>
              <input
                v-model="registerPassword"
                type="password"
                class="mt-2 w-full rounded-xl bg-[#0f1318] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-300">Confirmer</label>
              <input
                v-model="registerPasswordConfirm"
                type="password"
                class="mt-2 w-full rounded-xl bg-[#0f1318] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
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
            </transition>
          </div>

          <p class="mt-6 text-xs text-gray-400">
            En dev, le mode session utilise les cookies et le mode JWT utilise les tokens.
          </p>
        </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>
