<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const userProfile = computed(() => chatStore.userProfile)
</script>

<template>
  <div class="p-4 border-t border-border-dark">
    <button
      class="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
      type="button"
    >
      <div
        class="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10"
      >
        {{ userProfile.initials }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-200 truncate group-hover:text-primary transition-colors">
          {{ userProfile.name }}
        </p>
        <p class="text-xs text-gray-500 truncate">{{ userProfile.plan }}</p>
      </div>
      <span class="iconify hugeicons--more-horizontal text-gray-500 group-hover:text-gray-300"></span>
    </button>
  </div>
</template>
