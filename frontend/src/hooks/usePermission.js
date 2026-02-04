import { computed } from 'vue'
import { useUserStore } from '@/store/user'

export function usePermission() {
  const userStore = useUserStore()

  const isAdmin = computed(() => userStore.isAdmin)
  const isDirector = computed(() => userStore.isDirector)

  const hasRole = (role) => userStore.userInfo?.role === role
  const hasAnyRole = (roles) => roles.includes(userStore.userInfo?.role)

  return { isAdmin, isDirector, hasRole, hasAnyRole }
}
