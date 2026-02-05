<template>
  <div class="dashboard">
    <h2>欢迎使用农村互助养老积分超市管理系统</h2>
    
    <!-- 统计面板 -->
    <StatsPanel :statistics="statistics" class="stats-section" />

    <!-- 管理员看所有院点 -->
    <el-card v-if="userStore.isAdmin" class="institution-list">
      <template #header>
        <span>院点概览</span>
      </template>
      <el-table :data="institutionList" border>
        <el-table-column prop="name" label="院点名称" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 院长看本院信息 -->
    <el-card v-else class="institution-info">
      <template #header>
        <span>本院信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="院点名称">
          {{ userStore.userInstitution?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="地址">
          {{ userStore.userInstitution?.address }}
        </el-descriptions-item>
        <el-descriptions-item label="院长">
          {{ userStore.userInfo?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="账号">
          {{ userStore.userInfo?.username }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 图表和排行榜 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>积分趋势（近6个月）</span>
          </template>
          <LineChart :data="lineChartData" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <Rankings />
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-row :gutter="20" class="activity-row">
      <el-col :span="12">
        <RecentActivity />
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions-grid">
            <el-button type="primary" size="large" @click="$router.push('/grant')">
              <el-icon><Coin /></el-icon>
              <div>积分发放</div>
            </el-button>
            <el-button v-if="userStore.isDirector" type="success" size="large" @click="$router.push('/exchange')">
              <el-icon><ShoppingCart /></el-icon>
              <div>积分兑换</div>
            </el-button>
            <el-button v-if="userStore.isAdmin" type="warning" size="large" @click="$router.push('/products')">
              <el-icon><Goods /></el-icon>
              <div>商品管理</div>
            </el-button>
            <el-button type="info" size="large" @click="$router.push('/records')">
              <el-icon><List /></el-icon>
              <div>流水查询</div>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { getInstitutionList } from '@/api/institution'
import { getStatistics } from '@/api/records'
import LineChart from '@/components/Charts/LineChart.vue'
import StatsPanel from './Dashboard/StatsPanel.vue'
import RecentActivity from './Dashboard/RecentActivity.vue'
import Rankings from './Dashboard/Rankings.vue'

const userStore = useUserStore()

const institutionList = ref([])
const statistics = ref({
  persons: { helpers: 0, elderly: 0 },
  grant: { total_earned: 0 },
  exchange: { total_points_spent: 0 }
})

const lineChartData = ref([
  { date: '1月', grant: 120, exchange: 80 },
  { date: '2月', grant: 150, exchange: 100 },
  { date: '3月', grant: 180, exchange: 120 },
  { date: '4月', grant: 200, exchange: 150 },
  { date: '5月', grant: 250, exchange: 180 },
  { date: '6月', grant: 300, exchange: 220 }
])

const fetchInstitutions = async () => {
  try {
    const res = await getInstitutionList()
    institutionList.value = res.data
  } catch (error) {
    console.error('获取院点列表失败:', error)
  }
}

const fetchStatistics = async () => {
  try {
    const res = await getStatistics()
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  if (userStore.isAdmin) {
    fetchInstitutions()
  }
  fetchStatistics()
})
</script>

<style scoped>
.dashboard h2 {
  margin-bottom: 20px;
  color: #303133;
}

.stats-section {
  margin-bottom: 20px;
}

.institution-list,
.institution-info {
  margin-bottom: 20px;
}

.charts-row,
.activity-row {
  margin-bottom: 20px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.quick-actions-grid .el-button {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.quick-actions-grid .el-icon {
  font-size: 24px;
}
</style>
