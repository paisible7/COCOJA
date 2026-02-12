<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
}>()

const authStore = useAuthStore()
const textarea = ref<HTMLTextAreaElement>()

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)

  // Auto-resize
  target.style.height = ''
  target.style.height = target.scrollHeight + 'px'
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('send')
  }
}

function resetHeight() {
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      resetHeight()
    }
  },
)
</script>

<template>
  <div
    class="bg-surface-dark rounded-2xl shadow-floating border border-border-dark p-2 flex flex-col relative focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 transition-all duration-300"
  >
    <textarea
      ref="textarea"
      :value="modelValue"
      @input="handleInput"
      @keydown="handleKeydown"
      class="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-3 px-3 text-gray-100 placeholder-gray-500 leading-relaxed max-h-40 overflow-y-auto"
      placeholder="Envoyer un message..."
      rows="1"
    ></textarea>
    <div class="flex items-center justify-between px-2 pb-1 pt-1">
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-1">
        <button
          class="p-2 text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
          title="Joindre un fichier"
          type="button"
        >
          <span class="iconify hugeicons--attachment-01 text-[20px]"></span>
        </button>
        <button
          class="p-2 text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center"
          title="Entrée vocale"
          type="button"
        >
          <span class="iconify hugeicons--mic-01 text-[20px]"></span>
        </button>
      </div>
      <div v-else class="w-0"></div>
      <div class="flex items-center gap-3">
        <button
          @click="emit('send')"
          class="p-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          :disabled="!modelValue.trim()"
          type="button"
        >
          <span class="iconify hugeicons--sent text-[20px]"></span>
        </button>
      </div>
    </div>
  </div>
</template>
