<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const userProfile = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

function openAuthModal() {
  authStore.openModal()
}

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <div class="p-4 border-t border-border-dark">
    <div class="flex items-center gap-2">
      <button
        class="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
        type="button"
        @click="openAuthModal"
      >
        <div
          class="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10"
        >
          {{ userProfile?.username?.slice(0, 2).toUpperCase() || 'U' }}
        </div>
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-semibold text-gray-200 truncate group-hover:text-primary transition-colors"
          >
            {{ userProfile?.username || 'Se connecter' }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ userProfile?.email || 'Inscription rapide' }}
          </p>
        </div>
        <span
          class="iconify hugeicons--more-horizontal text-gray-500 group-hover:text-gray-300"
        ></span>
      </button>

      <button
        v-if="isAuthenticated"
        class="p-2 rounded-lg text-gray-500 hover:text-red-300 hover:bg-white/5"
        type="button"
        title="Se deconnecter"
        @click="handleLogout"
      >
        <span class="iconify hugeicons--logout-02"></span>
      </button>
    </div>
  </div>
</template>
