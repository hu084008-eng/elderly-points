<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h3>养老积分超市</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <!-- 管理员菜单 -->
        <template v-if="userStore.isAdmin">
          <el-menu-item index="/service-rules">
            <el-icon><Setting /></el-icon>
            <span>积分规则管理</span>
          </el-menu-item>
          <el-menu-item index="/activities">
            <el-icon><Calendar /></el-icon>
            <span>文娱活动管理</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>院长账号管理</span>
          </el-menu-item>
          <el-menu-item index="/institutions">
            <el-icon><OfficeBuilding /></el-icon>
            <span>院点管理</span>
          </el-menu-item>
        </template>
        
        <!-- 院长菜单 -->
        <template v-if="userStore.isDirector">
          <el-menu-item index="/exchange">
            <el-icon><ShoppingCart /></el-icon>
            <span>积分兑换</span>
          </el-menu-item>
        </template>
        
        <!-- 共用菜单（仅院长可见） -->
        <el-menu-item v-if="!userStore.isAdmin" index="/grant">
          <el-icon><Coin /></el-icon>
          <span>积分发放</span>
        </el-menu-item>
        <el-menu-item index="/helpers">
          <el-icon><User /></el-icon>
          <span>护工管理</span>
        </el-menu-item>
        <el-menu-item index="/elderly">
          <el-icon><UserFilled /></el-icon>
          <span>老人管理</span>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><List /></el-icon>
          <span>流水查询</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.isAdmin" index="/logs">
          <el-icon><Document /></el-icon>
          <span>系统日志</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.isAdmin" index="/system-status">
          <el-icon><Monitor /></el-icon>
          <span>系统状态</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ userStore.userInfo?.name }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  {{ userStore.userInfo?.role === 'admin' ? '总部管理员' : userStore.userInstitution?.name + '院长' }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确认退出登录吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    })
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid #1f2d3d;
}

.logo h3 {
  margin: 0;
  font-size: 18px;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  cursor: pointer;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
