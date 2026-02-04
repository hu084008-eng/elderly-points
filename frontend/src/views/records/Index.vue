<template>
  <div class="records-page">
    <el-tabs v-model="activeTab">
      <!-- 积分流水 -->
      <el-tab-pane label="积分流水" name="transactions">
        <el-card>
          <el-form :inline="true" class="search-form">
            <el-form-item label="院点" v-if="userStore.isAdmin">
              <el-select v-model="transactionQuery.institution_id" placeholder="全部" clearable>
                <el-option
                  v-for="item in institutionList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="transactionQuery.type" placeholder="全部" clearable>
                <el-option label="赚取" value="earn" />
                <el-option label="消费" value="spend" />
              </el-select>
            </el-form-item>
            <el-form-item label="服务类型">
              <el-select v-model="transactionQuery.service_category" placeholder="全部" clearable>
                <el-option label="到院互助" value="到院互助" />
                <el-option label="上门互助" value="上门互助" />
                <el-option label="院内互助" value="院内互助" />
                <el-option label="生产劳动" value="生产劳动" />
                <el-option label="文娱活动" value="文娱活动" />
                <el-option label="商品兑换" value="商品兑换" />
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
              <el-button type="primary" @click="fetchTransactions">
                <el-icon><Search /></el-icon> 查询
              </el-button>
              <el-button type="success" @click="handleExportTransactions">
                <el-icon><Download /></el-icon> 导出Excel
              </el-button>
            </el-form-item>
          </el-form>

          <el-table :data="transactionList" border v-loading="transactionLoading">
            <el-table-column type="index" width="50" label="序号" />
            <el-table-column prop="created_at" label="时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="target_name" label="人员" width="100" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.type === 'earn' ? 'success' : 'danger'">
                  {{ row.type === 'earn' ? '赚取' : '消费' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="积分" width="100">
              <template #default="{ row }">
                <span :class="row.type === 'earn' ? 'text-success' : 'text-danger'">
                  {{ row.type === 'earn' ? '+' : '' }}{{ row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="service_category" label="服务/活动类型" width="120" />
            <el-table-column prop="service_duration" label="时长" width="100" />
            <el-table-column prop="description" label="备注" show-overflow-tooltip />
            <el-table-column prop="operator_name" label="操作人" width="100" />
          </el-table>

          <el-pagination
            v-model:current-page="transactionQuery.page"
            v-model:page-size="transactionQuery.page_size"
            :total="transactionTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            class="pagination"
            @size-change="fetchTransactions"
            @current-change="fetchTransactions"
          />
        </el-card>
      </el-tab-pane>

      <!-- 兑换记录 -->
      <el-tab-pane label="兑换记录" name="exchanges">
        <el-card>
          <el-form :inline="true" class="search-form">
            <el-form-item label="院点" v-if="userStore.isAdmin">
              <el-select v-model="exchangeQuery.institution_id" placeholder="全部" clearable>
                <el-option
                  v-for="item in institutionList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="日期">
              <el-date-picker
                v-model="exchangeDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchExchanges">
                <el-icon><Search /></el-icon> 查询
              </el-button>
              <el-button type="success" @click="handleExportExchanges">
                <el-icon><Download /></el-icon> 导出Excel
              </el-button>
            </el-form-item>
          </el-form>

          <el-table :data="exchangeList" border v-loading="exchangeLoading">
            <el-table-column type="index" width="50" label="序号" />
            <el-table-column prop="exchange_date" label="兑换时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.exchange_date) }}
              </template>
            </el-table-column>
            <el-table-column prop="target_name" label="兑换人" width="100" />
            <el-table-column prop="product_name" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="total_points" label="消耗积分" width="100">
              <template #default="{ row }">
                <el-tag type="danger">-{{ row.total_points }}分</el-tag>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="exchangeQuery.page"
            v-model:page-size="exchangeQuery.page_size"
            :total="exchangeTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            class="pagination"
            @size-change="fetchExchanges"
            @current-change="fetchExchanges"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/user'
import { getInstitutionList } from '@/api/institution'
import { getTransactions, getExchanges, exportTransactions, exportExchanges } from '@/api/records'

const userStore = useUserStore()

const activeTab = ref('transactions')
const institutionList = ref([])

// 积分流水
const transactionLoading = ref(false)
const transactionList = ref([])
const transactionTotal = ref(0)
const dateRange = ref([])
const transactionQuery = reactive({
  institution_id: '',
  type: '',
  service_category: '',
  page: 1,
  page_size: 20
})

// 兑换记录
const exchangeLoading = ref(false)
const exchangeList = ref([])
const exchangeTotal = ref(0)
const exchangeDateRange = ref([])
const exchangeQuery = reactive({
  institution_id: '',
  page: 1,
  page_size: 20
})

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const fetchInstitutions = async () => {
  try {
    const res = await getInstitutionList()
    institutionList.value = res.data
  } catch (error) {
    console.error('获取院点失败:', error)
  }
}

const fetchTransactions = async () => {
  transactionLoading.value = true
  try {
    const params = { ...transactionQuery }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const res = await getTransactions(params)
    transactionList.value = res.data.list
    transactionTotal.value = res.data.pagination.total
  } finally {
    transactionLoading.value = false
  }
}

const fetchExchanges = async () => {
  exchangeLoading.value = true
  try {
    const params = { ...exchangeQuery }
    if (exchangeDateRange.value && exchangeDateRange.value.length === 2) {
      params.start_date = exchangeDateRange.value[0]
      params.end_date = exchangeDateRange.value[1]
    }
    const res = await getExchanges(params)
    exchangeList.value = res.data.list
    exchangeTotal.value = res.data.pagination.total
  } finally {
    exchangeLoading.value = false
  }
}

const handleExportTransactions = async () => {
  try {
    const params = { ...transactionQuery }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const res = await exportTransactions(params)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `积分流水_${new Date().toLocaleDateString()}.xlsx`
    link.click()
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const handleExportExchanges = async () => {
  try {
    const params = { ...exchangeQuery }
    if (exchangeDateRange.value && exchangeDateRange.value.length === 2) {
      params.start_date = exchangeDateRange.value[0]
      params.end_date = exchangeDateRange.value[1]
    }
    const res = await exportExchanges(params)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `兑换记录_${new Date().toLocaleDateString()}.xlsx`
    link.click()
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  if (userStore.isAdmin) {
    fetchInstitutions()
  }
  fetchTransactions()
  fetchExchanges()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>
