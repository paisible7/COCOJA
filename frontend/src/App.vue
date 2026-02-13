<script setup lang="ts">
import { ref, watch } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import ChatMain from './components/ChatMain.vue'
import AuthModal from './components/AuthModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const authStore = useAuthStore()
const chatStore = useChatStore()
const isMobileSidebarOpen = ref(false)

function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}

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

// Close mobile sidebar when switching chat
watch(
  () => chatStore.currentChatId,
  () => closeMobileSidebar(),
)
</script>

<template>
  <div class="dark h-screen flex overflow-hidden bg-background-dark text-gray-100">
    <!-- Desktop sidebar -->
    <AppSidebar v-if="authStore.isAuthenticated" class="hidden md:flex" />

    <!-- Mobile sidebar overlay -->
    <Teleport to="body">
      <Transition name="sidebar-overlay">
        <div
          v-if="isMobileSidebarOpen && authStore.isAuthenticated"
          class="fixed inset-0 bg-black/60 z-40 md:hidden"
          @click="closeMobileSidebar"
        ></div>
      </Transition>
    </Teleport>

    <!-- Mobile sidebar drawer -->
    <Transition name="sidebar-drawer">
      <AppSidebar
        v-if="isMobileSidebarOpen && authStore.isAuthenticated"
        class="fixed inset-y-0 left-0 z-50 md:hidden flex! w-70 shadow-2xl"
        @close="closeMobileSidebar"
      />
    </Transition>

    <ChatMain @toggle-sidebar="toggleMobileSidebar" />
  </div>
  <AuthModal />
</template>

<style scoped>
.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

.sidebar-drawer-enter-active,
.sidebar-drawer-leave-active {
  transition: transform 0.3s ease;
}
.sidebar-drawer-enter-from,
.sidebar-drawer-leave-to {
  transform: translateX(-100%);
}
</style>
