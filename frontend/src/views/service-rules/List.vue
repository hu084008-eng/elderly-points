<template>
  <div class="service-rules-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>积分规则管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增规则
          </el-button>
        </div>
      </template>

      <el-table :data="ruleList" border v-loading="loading">
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column prop="name" label="服务类型" min-width="150" />
        <el-table-column prop="points_per_hour" label="每小时积分" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.points_per_hour }}分/小时</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑积分规则' : '新增积分规则'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="规则编码" prop="code">
          <el-input v-model="form.code" placeholder="如：dao_yuan" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="服务类型" prop="name">
          <el-input v-model="form.name" placeholder="如：到院互助服务" />
        </el-form-item>
        <el-form-item label="每小时积分" prop="points_per_hour">
          <el-input-number v-model="form.points_per_hour" :min="1" :precision="0" />
          <span class="form-tip">服务每小时获得的积分</span>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="规则说明" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getServiceRuleList, createServiceRule, updateServiceRule, deleteServiceRule } from '@/api/service-rules'

const loading = ref(false)
const ruleList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = reactive({
  code: '',
  name: '',
  points_per_hour: 1,
  description: '',
  status: 1
})

const rules = {
  code: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入服务类型', trigger: 'blur' }],
  points_per_hour: [{ required: true, message: '请输入每小时积分', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getServiceRuleList()
    ruleList.value = res.data
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.code = ''
  form.name = ''
  form.points_per_hour = 1
  form.description = ''
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.code = row.code
  form.name = row.name
  form.points_per_hour = row.points_per_hour
  form.description = row.description
  form.status = row.status
  dialogVisible.value = true
}

const handleStatusChange = async (row) => {
  try {
    await updateServiceRule(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除规则【${row.name}】吗？`, '提示', {
      type: 'warning'
    })
    await deleteServiceRule(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateServiceRule(currentId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createServiceRule(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}
</style>
