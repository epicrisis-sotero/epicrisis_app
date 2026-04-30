import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'auth', requiresGuest: true },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/TermsView.vue'),
      meta: { layout: 'auth', requiresAuth: true, termsPage: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/annotate/:id',
      name: 'annotate',
      component: () => import('@/views/AnnotationView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { layout: 'main', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    await auth.fetchCurrentUser()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    if (!auth.hasAcceptedTerms) return { name: 'terms' }
    return auth.isAdmin ? { name: 'admin' } : { name: 'dashboard' }
  }

  // Redirect authenticated users without accepted terms to /terms (except the terms page itself)
  if (auth.isAuthenticated && !auth.hasAcceptedTerms && !to.meta.termsPage) {
    return { name: 'terms' }
  }

  // Redirect to admin by default if logged in and accessing root or dashboard as admin
  if (to.path === '/dashboard' && auth.isAdmin) {
    return { name: 'admin' }
  }
})

export default router
