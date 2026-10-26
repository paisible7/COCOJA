<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const props = defineProps<{
  modelValue: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  stop: []
}>()

const authStore = useAuthStore()
const chatStore = useChatStore()
const textarea = ref<HTMLTextAreaElement>()
const showModelMenu = ref(false)

const currentModel = computed(() => {
  return chatStore.availableModels.find(m => m.id === chatStore.selectedModel) || chatStore.availableModels[0]
})

function selectModel(modelId: string) {
  chatStore.setModel(modelId)
  showModelMenu.value = false
}

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
    if (!props.isLoading) {
      emit('send')
    }
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
      <div class="flex items-center gap-1">
        <!-- Model selector -->
        <div class="relative">
          <button
            @click="showModelMenu = !showModelMenu"
            class="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors text-xs font-medium"
            type="button"
            title="Sélectionner un modèle"
          >
            <span :class="['iconify', currentModel?.icon || 'hugeicons--ai-chat-02', 'text-sm']"></span>
            <span class="hidden sm:inline">{{ currentModel?.name || 'Axiom' }}</span>
            <span class="iconify hugeicons--arrow-down-01 text-xs"></span>
          </button>
          <transition
            enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showModelMenu" class="absolute bottom-full left-0 mb-2 bg-surface-dark border border-border-dark rounded-xl shadow-floating overflow-hidden min-w-52 z-50">
              <div class="px-3 py-2 border-b border-border-dark">
                <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Modèle</p>
              </div>
              <button
                v-for="model in chatStore.availableModels"
                :key="model.id"
                @click="selectModel(model.id)"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                  model.id === chatStore.selectedModel ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-surface-hover'
                ]"
                type="button"
              >
                <span :class="['iconify', model.icon, 'text-lg shrink-0']"></span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ model.name }}</p>
                  <p class="text-xs text-gray-500">{{ model.description }}</p>
                </div>
                <span v-if="model.id === chatStore.selectedModel" class="iconify hugeicons--checkmark-circle-02 text-primary text-base shrink-0"></span>
              </button>
            </div>
          </transition>
        </div>

        <template v-if="authStore.isAuthenticated">
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
        </template>
      </div>
      <div class="flex items-center gap-3">
        <!-- Bouton stop avec spinner pendant le chargement -->
        <button
          v-if="isLoading"
          @click="emit('stop')"
          class="relative w-9 h-9 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center justify-center"
          type="button"
          title="Arrêter la génération"
        >
          <svg class="absolute inset-0 w-9 h-9 animate-spin" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="currentColor" stroke-width="2.5" class="opacity-10" />
            <path d="M18 2a16 16 0 0 1 16 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="opacity-70" />
          </svg>
          <svg class="w-3.5 h-3.5 relative" viewBox="0 0 14 14" fill="currentColor">
            <rect x="1" y="1" width="12" height="12" rx="2" />
          </svg>
        </button>
        <!-- Bouton envoyer -->
        <button
          v-else
          @click="emit('send')"
          class="w-9 h-9 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          :disabled="!modelValue.trim()"
          type="button"
        >
          <span class="iconify hugeicons--sent text-[18px]"></span>
        </button>
      </div>
    </div>
  </div>
</template>
