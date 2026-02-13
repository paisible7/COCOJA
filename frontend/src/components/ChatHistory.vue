<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const editingChatId = ref<number | string | null>(null)
const editTitle = ref('')
const editInput = ref<HTMLInputElement>()

async function handleChatClick(chatId: number | string) {
  if (editingChatId.value === chatId) return
  await chatStore.switchToChat(chatId)
}

async function handleDeleteChat(chatId: number | string) {
  if (confirm('Supprimer cette conversation ?')) {
    await chatStore.deleteChat(chatId)
  }
}

async function startRename(chatId: number | string, currentTitle: string) {
  editingChatId.value = chatId
  editTitle.value = currentTitle
  await nextTick()
  editInput.value?.focus()
  editInput.value?.select()
}

async function confirmRename(chatId: number | string) {
  const trimmed = editTitle.value.trim()
  if (trimmed && trimmed !== chatStore.conversations.find(c => c.id === chatId)?.title) {
    await chatStore.updateChatTitle(chatId, trimmed)
  }
  editingChatId.value = null
}

function cancelRename() {
  editingChatId.value = null
}

function handleRenameKeydown(event: KeyboardEvent, chatId: number | string) {
  if (event.key === 'Enter') {
    event.preventDefault()
    confirmRename(chatId)
  } else if (event.key === 'Escape') {
    cancelRename()
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
                ? 'text-white bg-white/6 border border-white/6 shadow-sm'
                : 'text-gray-400 hover:bg-white/4 hover:text-gray-200',
            ]"
            @click="handleChatClick(chat.id)"
            @dblclick.stop="startRename(chat.id, chat.title)"
          >
            <span
              :class="[
                'iconify hugeicons--message-01 text-[16px] shrink-0',
                chat.id === currentChatId
                  ? 'text-primary'
                  : 'text-gray-600 group-hover:text-gray-400',
              ]"
            ></span>

            <!-- Inline rename input -->
            <input
              v-if="editingChatId === chat.id"
              ref="editInput"
              v-model="editTitle"
              class="flex-1 text-[13px] bg-surface-dark border border-primary/50 rounded px-1.5 py-0.5 text-gray-100 outline-none focus:ring-1 focus:ring-primary/50 min-w-0"
              @blur="confirmRename(chat.id)"
              @keydown="handleRenameKeydown($event, chat.id)"
              @click.stop
            />
            <span v-else class="truncate flex-1 text-[13px]">{{ chat.title }}</span>

            <!-- Actions -->
            <div v-if="editingChatId !== chat.id" class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                class="p-1 hover:text-primary transition-colors"
                title="Renommer"
                @click.stop="startRename(chat.id, chat.title)"
                type="button"
              >
                <span class="iconify hugeicons--pencil-edit-01 text-sm"></span>
              </button>
              <button
                class="p-1 hover:text-red-400 transition-colors"
                title="Supprimer"
                @click.stop="handleDeleteChat(chat.id)"
                type="button"
              >
                <span class="iconify hugeicons--delete-02 text-sm"></span>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
