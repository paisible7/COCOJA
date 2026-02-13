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
  retry: []
  editMessage: [id: string | number, text: string]
}>()

const copied = ref(false)
const isEditing = ref(false)
const editText = ref('')

function startEdit() {
  editText.value = props.message.text
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

function confirmEdit() {
  const trimmed = editText.value.trim()
  if (trimmed && trimmed !== props.message.text) {
    emit('editMessage', props.message.id, trimmed)
  }
  isEditing.value = false
}

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
  <div v-if="message.role === 'user'" class="flex flex-row-reverse message-fade-enter w-full group">
    <div class="flex flex-col items-end max-w-150 min-w-0">
      <!-- Edit mode -->
      <div v-if="isEditing" class="w-full max-w-150">
        <textarea
          v-model="editText"
          class="w-full bg-surface-dark border border-primary/50 rounded-xl px-4 py-3 text-sm text-gray-100 outline-none focus:ring-1 focus:ring-primary/50 resize-none min-h-20"
          @keydown.enter.exact.prevent="confirmEdit"
          @keydown.escape="cancelEdit"
        ></textarea>
        <div class="flex justify-end gap-2 mt-2">
          <button @click="cancelEdit" class="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 rounded-lg" type="button">Annuler</button>
          <button @click="confirmEdit" class="px-3 py-1.5 text-xs text-white bg-primary hover:bg-primary-600 rounded-lg" type="button">Enregistrer</button>
        </div>
      </div>
      <!-- Display mode -->
      <div v-else class="bg-bubble-user border border-border-dark px-5 py-3.5 rounded-2xl shadow-sm overflow-hidden">
        <p class="text-base leading-relaxed font-normal text-gray-100 wrap-break-word whitespace-pre-wrap overflow-wrap-anywhere" v-html="escapeHTML(message.text)" />
      </div>
      <!-- User message actions -->
      <div v-if="!isEditing" class="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="startEdit" class="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-md transition-colors" title="Modifier" type="button">
          <span class="iconify hugeicons--pencil-edit-01 text-sm"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Assistant message -->
  <div v-else class="flex message-fade-enter w-full group">
    <div class="flex flex-col max-w-175 min-w-0 w-full">
      <!-- Error message with retry -->
      <div v-if="message.isError" class="px-2 py-1">
        <div class="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <span class="iconify hugeicons--alert-02 text-red-400 text-lg shrink-0 mt-0.5"></span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-red-300">{{ message.text }}</p>
            <button
              @click="emit('retry')"
              class="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
              type="button"
            >
              <span class="iconify hugeicons--refresh text-sm"></span>
              Réessayer
            </button>
          </div>
        </div>
      </div>
      <!-- Normal assistant message -->
      <div v-else class="px-2 py-1 overflow-hidden">
        <div
          ref="contentRef"
          class="markdown-body text-[15px] leading-[1.7] font-light text-gray-300 wrap-break-word"
          v-html="renderMarkdown(message.text)"
        />
      </div>
      <!-- Message actions -->
      <div v-if="!message.isError" class="flex items-center gap-1 px-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
