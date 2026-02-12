<script setup lang="ts">
import type { Message } from '@/types/chat'
import { escapeHTML } from '@/utils/helpers'

defineProps<{
  message: Message
}>()
</script>

<template>
  <div v-if="message.role === 'user'" class="flex flex-row-reverse message-fade-enter w-full">
    <div class="flex flex-col items-end max-w-[600px] min-w-0">
      <div
        class="bg-bubble-user border border-border-dark px-5 py-3.5 rounded-2xl shadow-sm overflow-hidden"
      >
        <p class="text-base leading-relaxed font-normal text-gray-100 break-words whitespace-pre-wrap overflow-wrap-anywhere" v-html="escapeHTML(message.text)" />
      </div>
    </div>
  </div>

  <div v-else class="flex message-fade-enter w-full">
    <div class="flex flex-col max-w-[700px] min-w-0">
      <div class="px-2 py-1 overflow-hidden">
        <p class="text-[15px] leading-[1.7] font-light text-gray-300 break-words whitespace-pre-wrap overflow-wrap-anywhere" v-html="escapeHTML(message.text)" />
      </div>
    </div>
  </div>
</template>
