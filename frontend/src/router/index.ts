import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { render: () => null },
    },
    {
      path: '/chat/:id',
      name: 'chat',
      component: { render: () => null },
    },
  ],
})

export default router
