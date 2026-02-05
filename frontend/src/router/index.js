import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      // 管理员专属路由
      {
        path: 'service-rules',
        name: 'ServiceRules',
        component: () => import('@/views/service-rules/List.vue'),
        meta: { title: '积分规则管理', adminOnly: true }
      },
      {
        path: 'activities',
        name: 'Activities',
        component: () => import('@/views/activities/List.vue'),
        meta: { title: '文娱活动管理', adminOnly: true }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/List.vue'),
        meta: { title: '商品管理', adminOnly: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/List.vue'),
        meta: { title: '院长账号管理', adminOnly: true }
      },
      {
        path: 'institutions',
        name: 'Institutions',
        component: () => import('@/views/institutions/List.vue'),
        meta: { title: '院点管理', adminOnly: true }
      },
      // 院长专属路由
      {
        path: 'exchange',
        name: 'Exchange',
        component: () => import('@/views/exchange/Index.vue'),
        meta: { title: '积分兑换', directorOnly: true }
      },
      // 共用路由
      {
        path: 'grant',
        name: 'Grant',
        component: () => import('@/views/grant/Index.vue'),
        meta: { title: '积分发放' }
      },
      {
        path: 'helpers',
        name: 'Helpers',
        component: () => import('@/views/helpers/List.vue'),
        meta: { title: '护工管理' }
      },
      {
        path: 'elderly',
        name: 'Elderly',
        component: () => import('@/views/elderly/List.vue'),
        meta: { title: '老人管理' }
      },
      {
        path: 'records',
        name: 'Records',
        component: () => import('@/views/records/Index.vue'),
        meta: { title: '流水查询' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/logs/Index.vue'),
        meta: { title: '系统日志', adminOnly: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'system-status',
        name: 'SystemStatus',
        component: () => import('@/views/SystemStatus.vue'),
        meta: { title: '系统状态', adminOnly: true }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 公开路由直接通过
  if (to.meta.public) {
    next()
    return
  }
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }
  
  // 检查管理员权限
  if (to.meta.adminOnly && !userStore.isAdmin) {
    ElMessage.error('权限不足')
    next('/dashboard')
    return
  }
  
  // 检查院长权限
  if (to.meta.directorOnly && !userStore.isDirector) {
    ElMessage.error('权限不足')
    next('/dashboard')
    return
  }
  
  next()
})

export default router
