<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { Message } from '@/types/chat'
import { escapeHTML, renderMarkdown, copyToClipboard } from '@/utils/helpers'

const props = defineProps<{
  message: Message
  isLast?: boolean
  isLastAssistant?: boolean
}>()

const emit = defineEmits<{
  regenerate: []
}>()

const copied = ref(false)

async function handleCopyMessage() {
  const success = await copyToClipboard(props.message.text)
  if (success) {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

function setupCodeCopyButtons(el: HTMLElement) {
  el.querySelectorAll('.copy-code-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = (btn as HTMLElement).dataset.code || ''
      const success = await copyToClipboard(code)
      if (success) {
        const textEl = btn.querySelector('.copy-text')
        if (textEl) {
          textEl.textContent = 'Copié !'
          setTimeout(() => (textEl.textContent = 'Copier'), 2000)
        }
      }
    })
  })
}

const contentRef = ref<HTMLElement>()

onMounted(async () => {
  await nextTick()
  if (contentRef.value) {
    setupCodeCopyButtons(contentRef.value)
  }
})
</script>

<template>
  <!-- User message -->
  <div v-if="message.role === 'user'" class="flex flex-row-reverse message-fade-enter w-full">
    <div class="flex flex-col items-end max-w-150 min-w-0">
      <div
        class="bg-bubble-user border border-border-dark px-5 py-3.5 rounded-2xl shadow-sm overflow-hidden"
      >
        <p class="text-base leading-relaxed font-normal text-gray-100 wrap-break-word whitespace-pre-wrap overflow-wrap-anywhere" v-html="escapeHTML(message.text)" />
      </div>
    </div>
  </div>

  <!-- Assistant message -->
  <div v-else class="flex message-fade-enter w-full group">
    <div class="flex flex-col max-w-175 min-w-0 w-full">
      <div class="px-2 py-1 overflow-hidden">
        <div
          ref="contentRef"
          class="markdown-body text-[15px] leading-[1.7] font-light text-gray-300 wrap-break-word"
          v-html="renderMarkdown(message.text)"
        />
      </div>
      <!-- Message actions -->
      <div class="flex items-center gap-1 px-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click="handleCopyMessage"
          class="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md transition-colors"
          :title="copied ? 'Copié !' : 'Copier le message'"
          type="button"
        >
          <span v-if="copied" class="iconify hugeicons--checkmark-circle-02 text-primary text-sm"></span>
          <span v-else class="iconify hugeicons--copy-01 text-sm"></span>
        </button>
        <button
          v-if="isLastAssistant"
          @click="emit('regenerate')"
          class="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md transition-colors"
          title="Régénérer la réponse"
          type="button"
        >
          <span class="iconify hugeicons--refresh text-sm"></span>
        </button>
      </div>
    </div>
  </div>
</template>
