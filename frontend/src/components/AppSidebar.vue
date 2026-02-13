<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import ChatHistory from './ChatHistory.vue'
import UserProfile from './UserProfile.vue'

const chatStore = useChatStore()
const isCollapsed = computed(() => chatStore.sidebarCollapsed)

defineEmits<{
  close: []
}>()

async function handleNewChat() {
  await chatStore.createNewChat()
}
</script>

<template>
  <aside
    :class="[
      'shrink-0 bg-[#0a0c10] border-r border-border-dark flex flex-col h-full transition-all duration-300 z-20 overflow-hidden',
      isCollapsed ? 'w-16' : 'w-70',
    ]"
  >
    <div class="p-4 pt-6 flex items-center gap-2">
      <!-- Collapse toggle -->
      <button
        @click="chatStore.toggleSidebarCollapse()"
        class="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0"
        :title="isCollapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'"
        type="button"
      >
        <span :class="['iconify text-lg', isCollapsed ? 'hugeicons--sidebar-right' : 'hugeicons--sidebar-left']"></span>
      </button>

      <!-- New chat button -->
      <button
        v-if="!isCollapsed"
        @click="handleNewChat"
        class="flex-1 flex items-center gap-3 px-4 py-3 bg-surface-dark border border-border-dark rounded-xl hover:border-primary/40 hover:bg-surface-hover transition-all duration-200 group shadow-sm"
        type="button"
      >
        <span
          class="flex items-center justify-center w-7 h-7 bg-primary/20 text-primary-300 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors"
        >
          <span class="iconify hugeicons--add-01 text-base"></span>
        </span>
        <span class="text-sm font-semibold text-gray-200">Nouveau chat</span>
      </button>

      <!-- Collapsed new chat icon -->
      <button
        v-else
        @click="handleNewChat"
        class="p-2 text-gray-400 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
        title="Nouveau chat"
        type="button"
      >
        <span class="iconify hugeicons--add-01 text-lg"></span>
      </button>
    </div>

    <ChatHistory v-if="!isCollapsed" />
    <div v-if="isCollapsed" class="flex-1"></div>
    <UserProfile :collapsed="isCollapsed" />
  </aside>
</template>
