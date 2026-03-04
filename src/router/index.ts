import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/curriculums'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    
    // Control domain: Curriculum
    {
      path: '/curriculums',
      name: 'Curriculums',
      component: () => import('@/pages/CurriculumsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/curriculums/new',
      name: 'CurriculumNew',
      component: () => import('@/pages/CurriculumNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/curriculums/:id',
      name: 'CurriculumEdit',
      component: () => import('@/pages/CurriculumEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Control domain: Rating
    {
      path: '/ratings',
      name: 'Ratings',
      component: () => import('@/pages/RatingsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ratings/new',
      name: 'RatingNew',
      component: () => import('@/pages/RatingNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ratings/:id',
      name: 'RatingEdit',
      component: () => import('@/pages/RatingEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Control domain: Review
    {
      path: '/reviews',
      name: 'Reviews',
      component: () => import('@/pages/ReviewsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reviews/new',
      name: 'ReviewNew',
      component: () => import('@/pages/ReviewNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reviews/:id',
      name: 'ReviewEdit',
      component: () => import('@/pages/ReviewEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    
    // Create domain: Event
    {
      path: '/events',
      name: 'Events',
      component: () => import('@/pages/EventsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events/new',
      name: 'EventNew',
      component: () => import('@/pages/EventNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events/:id',
      name: 'EventView',
      component: () => import('@/pages/EventViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    
    // Consume domain: Resource
    {
      path: '/resources',
      name: 'Resources',
      component: () => import('@/pages/ResourcesListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/resources/:id',
      name: 'ResourceView',
      component: () => import('@/pages/ResourceViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Path
    {
      path: '/paths',
      name: 'Paths',
      component: () => import('@/pages/PathsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/paths/:id',
      name: 'PathView',
      component: () => import('@/pages/PathViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Admin route
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/pages/AdminPage.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()
  
  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole && !hasStoredRole(requiredRole)) {
    // Redirect to default page if user doesn't have required role
    next({ name: 'Curriculums' })
    return
  }
  
  next()
})

router.afterEach((to) => {
  document.title = to.path === '/login' ? 'Question Queue Login' : 'Member'
})

export default router