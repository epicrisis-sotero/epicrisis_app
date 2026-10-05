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
      path: '/guia',
      name: 'guia',
      component: () => import('@/views/GuiaAnotacionView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/glosario',
      name: 'glosario',
      component: () => import('@/views/GlosarioView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { layout: 'main', requiresAuth: true, requiresAdmin: true },
    },
    {
      // Ojo: la ruta NO puede empezar con /api — el proxy de Vite reenvía todo
      // ese prefijo al backend y la ruta del SPA nunca se resolvería en local.
      path: '/documentacion-api',
      name: 'api-docs',
      component: () => import('@/views/ApiDocsView.vue'),
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
    if (!auth.isAdmin && !auth.hasAcceptedTerms) return { name: 'terms' }
    return auth.isAdmin ? { name: 'admin' } : { name: 'dashboard' }
  }

  // Admins skip terms; users already accepted skip terms; terms page itself is exempt
  if (auth.isAuthenticated && !auth.isAdmin && !auth.hasAcceptedTerms && !to.meta.termsPage) {
    return { name: 'terms' }
  }

  // Already accepted terms → don't show terms page again
  if (to.meta.termsPage && auth.isAuthenticated && (auth.isAdmin || auth.hasAcceptedTerms)) {
    return auth.isAdmin ? { name: 'admin' } : { name: 'dashboard' }
  }

  // Redirect to admin by default if logged in and accessing root or dashboard as admin
  if (to.path === '/dashboard' && auth.isAdmin) {
    return { name: 'admin' }
  }
})

export default router
