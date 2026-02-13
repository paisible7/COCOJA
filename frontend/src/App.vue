<script setup lang="ts">
import { watch } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import ChatMain from './components/ChatMain.vue'
import AuthModal from './components/AuthModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const authStore = useAuthStore()
const chatStore = useChatStore()

authStore.initAuth()

watch(
  () => authStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      await chatStore.initForUser()
    } else {
      chatStore.resetForGuest()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="dark h-screen flex overflow-hidden bg-background-dark text-gray-100">
    <AppSidebar v-if="authStore.isAuthenticated" />
    <ChatMain />
  </div>
  <AuthModal />
</template>

<style scoped></style>
