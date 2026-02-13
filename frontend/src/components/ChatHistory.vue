<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

async function handleChatClick(chatId: number | string) {
  await chatStore.switchToChat(chatId)
}

async function handleDeleteChat(chatId: number | string) {
  if (confirm('Supprimer cette conversation ?')) {
    await chatStore.deleteChat(chatId)
  }
}

const groupedChats = computed(() => chatStore.groupedConversations)
const currentChatId = computed(() => chatStore.currentChatId)
</script>

<template>
  <div class="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
    <div v-if="Object.keys(groupedChats).length === 0" class="px-3 py-8 text-center">
      <span class="iconify hugeicons--message-01 text-3xl text-gray-700 mx-auto mb-2"></span>
      <p class="text-gray-500 text-sm">Aucune conversation</p>
    </div>

    <div v-for="(chats, period) in groupedChats" :key="period">
      <h3 class="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {{ period }}
      </h3>
      <ul class="space-y-0.5">
        <li v-for="chat in chats" :key="chat.id">
          <div
            :class="[
              'flex items-center gap-2.5 px-3 py-2 text-sm group cursor-pointer transition-colors rounded-lg',
              chat.id === currentChatId
                ? 'text-white bg-white/[0.06] border border-white/[0.06] shadow-sm'
                : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200',
            ]"
            @click="handleChatClick(chat.id)"
          >
            <span
              :class="[
                'iconify hugeicons--message-01 text-[16px] shrink-0',
                chat.id === currentChatId
                  ? 'text-primary'
                  : 'text-gray-600 group-hover:text-gray-400',
              ]"
            ></span>
            <span class="truncate flex-1 text-[13px]">{{ chat.title }}</span>
            <button
              class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 shrink-0"
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
