<script setup lang="ts">
import type { Message } from '@/types/chat'
import { escapeHTML } from '@/utils/helpers'

defineProps<{
  message: Message
}>()
</script>

<template>
  <div v-if="message.role === 'user'" class="flex flex-row-reverse gap-4 group message-fade-enter">
    <div class="flex-shrink-0 mt-1">
      <div
        class="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 ring-2 ring-background-dark"
      ></div>
    </div>
    <div class="flex flex-col items-end max-w-[85%] md:max-w-[75%]">
      <div
        class="bg-bubble-user border border-border-dark px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm"
      >
        <p class="text-[15px] leading-relaxed font-light" v-html="escapeHTML(message.text)" />
      </div>
    </div>
  </div>

  <div v-else class="flex gap-4 group message-fade-enter">
    <div class="flex-shrink-0 mt-1">
      <div
        class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg ring-2 ring-background-dark"
      >
        <span class="iconify hugeicons--ai-chat-02 text-white text-lg"></span>
      </div>
    </div>
    <div class="flex flex-col max-w-[90%] md:max-w-[85%]">
      <div class="prose prose-sm prose-invert max-w-none">
        <p class="text-[15px] leading-relaxed text-gray-300" v-html="escapeHTML(message.text)" />
      </div>
    </div>
  </div>
</template>
