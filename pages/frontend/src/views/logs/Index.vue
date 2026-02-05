<template>
  <div class="logs-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统操作日志</span>
          <el-button type="danger" @click="handleCleanup">
            <el-icon><Delete /></el-icon> 清理旧日志
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item label="操作类型">
          <el-select v-model="query.action" placeholder="全部" clearable>
            <el-option label="登录" value="登录" />
            <el-option label="新增" value="新增" />
            <el-option label="修改" value="修改" />
            <el-option label="删除" value="删除" />
            <el-option label="发放积分" value="发放积分" />
            <el-option label="兑换" value="兑换" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="query.module" placeholder="全部" clearable>
            <el-option label="护工" value="护工" />
            <el-option label="老人" value="老人" />
            <el-option label="商品" value="商品" />
            <el-option label="活动" value="活动" />
            <el-option label="积分" value="积分" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">
            <el-icon><Search /></el-icon> 查询
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="logList" border v-loading="loading" size="small">
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="created_at" label="时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="action" label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="ip_address" label="IP地址" width="130" />
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.page_size"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card>
          <template #header>操作类型分布</template>
          <div v-for="item in actionStats" :key="item.action" class="stat-item">
            <span>{{ item.action }}</span>
            <el-tag>{{ item.count }}次</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>模块访问统计</template>
          <div v-for="item in moduleStats" :key="item.module" class="stat-item">
            <span>{{ item.module }}</span>
            <el-tag type="success">{{ item.count }}次</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>活跃用户TOP10</template>
          <div v-for="(item, index) in userStats" :key="index" class="stat-item">
            <span>{{ item.username || '匿名' }}</span>
            <el-tag type="warning">{{ item.count }}次</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getLogList, getLogStatistics, cleanupLogs } from '@/api/logs'

const loading = ref(false)
const logList = ref([])
const total = ref(0)
const dateRange = ref([])

const actionStats = ref([])
const moduleStats = ref([])
const userStats = ref([])

const query = reactive({
  action: '',
  module: '',
  page: 1,
  page_size: 20
})

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const getActionType = (action) => {
  const types = {
    '登录': 'primary',
    '新增': 'success',
    '修改': 'warning',
    '删除': 'danger',
    '发放积分': 'success',
    '兑换': 'info'
  }
  return types[action] || ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { ...query }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const res = await getLogList(params)
    logList.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const res = await getLogStatistics()
    actionStats.value = res.data.action
    moduleStats.value = res.data.module
    userStats.value = res.data.user
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const handleCleanup = async () => {
  try {
    const { value } = await ElMessageBox.prompt(
      '请输入要保留的天数（默认30天）',
      '清理旧日志',
      {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        inputPattern: /^[1-9]\d*$/,
        inputErrorMessage: '请输入正整数',
        inputValue: '30'
      }
    )
    
    const res = await cleanupLogs({ days: parseInt(value) })
    ElMessage.success(res.message)
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清理失败:', error)
    }
  }
}

onMounted(() => {
  fetchData()
  fetchStatistics()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.stats-row {
  margin-top: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  border-bottom: none;
}
</style>
