<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'

const chatStore = useChatStore()
const authStore = useAuthStore()

function handleChatClick(chatId: string) {
  chatStore.switchToChat(chatId, authStore.isAuthenticated)
}

function handleDeleteChat(chatId: string) {
  if (confirm('Supprimer cette conversation ?')) {
    chatStore.deleteChat(chatId, authStore.isAuthenticated)
  }
}

const groupedChats = computed(() => chatStore.groupedConversations)
const currentChatId = computed(() => chatStore.currentChatId)
</script>

<template>
  <div class="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
    <div v-if="Object.keys(groupedChats).length === 0" class="px-3 py-8 text-center">
      <p class="text-gray-500 text-sm">Aucune conversation</p>
    </div>

    <div v-for="(chats, period) in groupedChats" :key="period">
      <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {{ period }}
      </h3>
      <ul class="space-y-1">
        <li v-for="chat in chats" :key="chat.id">
          <div
            :class="[
              'flex items-center gap-2 px-3 py-2.5 text-sm group cursor-pointer transition-colors',
              chat.id === currentChatId
                ? 'text-white bg-white/5 rounded-lg border border-white/5 shadow-sm'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg',
            ]"
            @click="handleChatClick(chat.id)"
          >
            <span
              :class="[
                'iconify hugeicons--message-01 text-lg',
                chat.id === currentChatId
                  ? 'text-primary'
                  : 'text-gray-600 group-hover:text-gray-400',
              ]"
            ></span>
            <span class="truncate flex-1">{{ chat.title }}</span>
            <button
              class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"
              title="Supprimer"
              @click.stop="handleDeleteChat(chat.id)"
              type="button"
            >
              <span class="iconify hugeicons--delete-02 text-sm"></span>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
