<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const userProfile = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)

function openAuthModal() {
  authStore.openModal()
}

function askLogout() {
  showLogoutModal.value = true
}

async function confirmLogout() {
  isLoggingOut.value = true
  try {
    await authStore.logout()
  } finally {
    isLoggingOut.value = false
    showLogoutModal.value = false
  }
}

function cancelLogout() {
  showLogoutModal.value = false
}
</script>

<template>
  <div class="p-3 border-t border-border-dark">
    <!-- Profil utilisateur -->
    <div class="flex items-center gap-2">
      <div
        class="flex items-center gap-3 flex-1 min-w-0 px-2 py-2 rounded-lg text-left group cursor-pointer hover:bg-white/5 transition-colors"
        @click="isAuthenticated ? askLogout() : openAuthModal()"
      >
        <div
          class="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-primary to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10"
        >
          {{ userProfile?.username?.slice(0, 2).toUpperCase() || 'U' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-200 truncate group-hover:text-primary transition-colors">
            {{ userProfile?.username || 'Se connecter' }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ userProfile?.email || 'Inscription rapide' }}
          </p>
        </div>
        <span
          v-if="isAuthenticated"
          class="iconify hugeicons--logout-02 text-gray-500 group-hover:text-red-300 shrink-0 transition-colors"
        ></span>
      </div>
    </div>
  </div>

  <!-- Modal de confirmation de déconnexion -->
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showLogoutModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative h-full flex items-center justify-center px-4" @click.self="cancelLogout">
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showLogoutModal"
              class="w-full max-w-sm bg-[#1a2028] border border-white/10 rounded-2xl shadow-xl p-6 text-center"
            >
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10">
                <span class="iconify hugeicons--logout-02 text-2xl text-red-400"></span>
              </div>
              <h3 class="text-lg font-semibold text-white mb-1">Se déconnecter ?</h3>
              <p class="text-sm text-gray-400 mb-6">Tu devras te reconnecter pour accéder à tes conversations.</p>
              <div class="flex gap-3">
                <button
                  @click="cancelLogout"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  @click="confirmLogout"
                  :disabled="isLoggingOut"
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  type="button"
                >
                  <svg v-if="isLoggingOut" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {{ isLoggingOut ? 'Déconnexion...' : 'Déconnecter' }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>
