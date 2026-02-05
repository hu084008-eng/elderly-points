<template>
  <div class="stats-panel">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statsList" :key="item.title">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" :style="{ background: item.color }">
              <el-icon :size="24" color="#fff">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  statistics: { type: Object, default: () => ({}) }
})

const statsList = computed(() => [
  {
    title: '护工人数',
    value: props.statistics.persons?.helpers || 0,
    icon: 'User',
    color: '#409EFF'
  },
  {
    title: '老人人数',
    value: props.statistics.persons?.elderly || 0,
    icon: 'UserFilled',
    color: '#67C23A'
  },
  {
    title: '总发放积分',
    value: props.statistics.grant?.total_earned || 0,
    icon: 'Coin',
    color: '#E6A23C'
  },
  {
    title: '总兑换积分',
    value: props.statistics.exchange?.total_points_spent || 0,
    icon: 'ShoppingCart',
    color: '#F56C6C'
  }
])
</script>

<style scoped>
.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}
</style>
