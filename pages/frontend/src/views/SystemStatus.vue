<template>
  <div class="system-status">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>系统状态</template>
          <div class="status-item">
            <span>运行时间</span>
            <span>{{ formatUptime(safeStatus.uptime) }}</span>
          </div>
          <div class="status-item">
            <span>Node版本</span>
            <span>{{ safeStatus.nodeVersion }}</span>
          </div>
          <div class="status-item">
            <span>操作系统</span>
            <span>{{ safeStatus.platform }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>内存使用</template>
          <div class="status-item">
            <span>已使用</span>
            <span>{{ formatBytes(safeStatus.memory.heapUsed) }}</span>
          </div>
          <div class="status-item">
            <span>总分配</span>
            <span>{{ formatBytes(safeStatus.memory.heapTotal) }}</span>
          </div>
          <div class="status-item">
            <span>常驻内存</span>
            <span>{{ formatBytes(safeStatus.memory.rss) }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>健康检查</template>
          <div class="status-item">
            <span>数据库</span>
            <el-tag :type="safeHealth.checks.database ? 'success' : 'danger'">
              {{ safeHealth.checks.database ? '正常' : '异常' }}
            </el-tag>
          </div>
          <div class="status-item">
            <span>缓存</span>
            <el-tag :type="safeHealth.checks.cache ? 'success' : 'danger'">
              {{ safeHealth.checks.cache ? '正常' : '异常' }}
            </el-tag>
          </div>
          <div class="status-item">
            <span>整体状态</span>
            <el-tag :type="safeHealth.status === 'healthy' ? 'success' : 'danger'">
              {{ safeHealth.status === 'healthy' ? '健康' : '异常' }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const status = ref({
  uptime: 0,
  nodeVersion: '-',
  platform: '-',
  memory: { heapUsed: 0, heapTotal: 0, rss: 0 }
})
const health = ref({
  status: 'unknown',
  checks: { database: false, cache: false }
})

// 确保响应式数据安全访问
const safeStatus = computed(() => ({
  uptime: status.value?.uptime || 0,
  nodeVersion: status.value?.nodeVersion || '-',
  platform: status.value?.platform || '-',
  memory: status.value?.memory || { heapUsed: 0, heapTotal: 0, rss: 0 }
}))

const safeHealth = computed(() => ({
  status: health.value?.status || 'unknown',
  checks: health.value?.checks || { database: false, cache: false }
}))

const fetchStatus = async () => {
  try {
    const [statusRes, healthRes] = await Promise.all([
      axios.get('/health/status'),
      axios.get('/health')
    ])
    status.value = statusRes.data.data
    health.value = healthRes.data
  } catch (error) {
    console.error('获取系统状态失败:', error)
  }
}

const formatUptime = (seconds) => {
  if (!seconds) return '-'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}天${hours}小时${minutes}分钟`
}

const formatBytes = (bytes) => {
  if (!bytes) return '-'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

onMounted(fetchStatus)
</script>

<style scoped>
.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.status-item:last-child {
  border-bottom: none;
}
</style>
