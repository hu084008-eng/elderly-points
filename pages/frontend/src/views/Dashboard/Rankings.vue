<template>
  <el-card>
    <template #header>
      <span>积分排行榜</span>
    </template>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="护工" name="helpers">
        <el-table :data="helperRank" size="small" :show-header="false">
          <el-table-column width="50">
            <template #default="{ $index }">
              <el-tag :type="$index < 3 ? 'danger' : ''">{{ $index + 1 }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" />
          <el-table-column prop="total_points" align="right">
            <template #default="{ row }">
              <el-tag type="success">{{ row.total_points }}分</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <el-tab-pane label="老人" name="elderly">
        <el-table :data="elderlyRank" size="small" :show-header="false">
          <el-table-column width="50">
            <template #default="{ $index }">
              <el-tag :type="$index < 3 ? 'danger' : ''">{{ $index + 1 }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" />
          <el-table-column prop="total_points" align="right">
            <template #default="{ row }">
              <el-tag type="success">{{ row.total_points }}分</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHelperList } from '@/api/helpers'
import { getElderlyList } from '@/api/elderly'

const activeTab = ref('helpers')
const helperRank = ref([])
const elderlyRank = ref([])

onMounted(async () => {
  try {
    const [helpersRes, elderlyRes] = await Promise.all([
      getHelperList(),
      getElderlyList()
    ])
    helperRank.value = helpersRes.data
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 10)
    elderlyRank.value = elderlyRes.data
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 10)
  } catch (error) {
    console.error('获取排行榜失败:', error)
  }
})
</script>
