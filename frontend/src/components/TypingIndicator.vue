<script setup lang="ts">
const isTyping = defineModel<boolean>('isTyping', { default: false })
</script>

<template>
  <div v-if="isTyping" class="flex gap-4 message-fade-enter">
    <div class="shrink-0 mt-1">
      <div
        class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center ring-2 ring-background-dark"
      >
        <span class="iconify hugeicons--ai-chat-02 text-white text-sm"></span>
      </div>
    </div>
    <div class="flex items-center gap-1.5 mt-4">
      <span class="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
      <span
        class="w-2 h-2 bg-primary rounded-full animate-bounce"
        style="animation-delay: 0.15s"
      ></span>
      <span
        class="w-2 h-2 bg-primary rounded-full animate-bounce"
        style="animation-delay: 0.3s"
      ></span>
    </div>
  </div>
</template>
