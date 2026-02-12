<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import ChatHistory from './ChatHistory.vue'
import UserProfile from './UserProfile.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()

function handleNewChat() {
  chatStore.createNewChat(authStore.isAuthenticated)
}
</script>

<template>
  <aside
    class="w-[280px] flex-shrink-0 bg-[#0a0c10] border-r border-border-dark flex flex-col h-full transition-all duration-300 hidden md:flex z-20"
  >
    <div class="p-4 pt-6">
      <button
        @click="handleNewChat"
        class="w-full flex items-center gap-3 px-4 py-3 bg-surface-dark border border-border-dark rounded-xl hover:border-primary/40 hover:bg-surface-hover transition-all duration-200 group shadow-sm"
        type="button"
      >
        <span
          class="bg-primary/20 text-primary-300 rounded-lg p-1 group-hover:bg-primary group-hover:text-white transition-colors"
        >
          <span class="iconify hugeicons--add-01 text-sm"></span>
        </span>
        <span class="text-sm font-semibold text-gray-200">Nouveau chat</span>
      </button>
    </div>

    <ChatHistory />
    <UserProfile />
  </aside>
</template>
