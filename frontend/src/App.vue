<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
import ChatMain from './components/ChatMain.vue'
</script>

<template>
  <div class="dark h-screen flex overflow-hidden bg-background-dark text-gray-100">
    <AppSidebar />
    <ChatMain />
  </div>
</template>

<style scoped></style>
