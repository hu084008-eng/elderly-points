<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>最近动态</span>
        <el-button link @click="$router.push('/records')">查看全部</el-button>
      </div>
    </template>
    
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :type="activity.type"
        :timestamp="activity.time"
      >
        {{ activity.content }}
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTransactions } from '@/api/records'

const activities = ref([])

const fetchRecent = async () => {
  try {
    const res = await getTransactions({ page: 1, page_size: 5 })
    activities.value = res.data.list.map(item => ({
      content: `${item.operator_name} ${item.type === 'earn' ? '发放' : '扣除'} ${item.target_name} ${Math.abs(item.amount)} 积分`,
      time: new Date(item.created_at).toLocaleString(),
      type: item.type === 'earn' ? 'success' : 'danger'
    }))
  } catch (error) {
    console.error('获取最近动态失败:', error)
  }
}

onMounted(fetchRecent)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
