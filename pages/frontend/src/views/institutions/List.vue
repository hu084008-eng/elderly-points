<template>
  <div class="institutions-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>院点管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增院点
          </el-button>
        </div>
      </template>

      <el-table :data="institutionList" border v-loading="loading">
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="name" label="院点名称" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="director" label="院长账号">
          <template #default="{ row }">
            <span v-if="row.director">{{ row.director.username }}</span>
            <el-tag v-else type="warning" size="small">未设置</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-popconfirm
              title="确定删除该院点吗？将同时删除院长账号！"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑院点' : '新增院点'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="院点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入院点名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 新增时显示院长账号设置 -->
        <template v-if="!isEdit">
          <el-divider>院长账号设置</el-divider>
          <el-form-item label="院长账号" prop="director_username">
            <el-input v-model="form.director_username" placeholder="请输入院长登录账号" />
          </el-form-item>
          <el-form-item label="初始密码" prop="director_password">
            <el-input
              v-model="form.director_password"
              type="password"
              placeholder="请输入初始密码"
              show-password
            />
          </el-form-item>
        </template>
        
        <!-- 编辑时显示修改密码选项 -->
        <template v-else>
          <el-divider>院长密码</el-divider>
          <el-form-item label="新密码" prop="director_password">
            <el-input
              v-model="form.director_password"
              type="password"
              placeholder="不修改请留空"
              show-password
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="重置院长密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="院点">
          <span>{{ currentInstitution?.name }}</span>
        </el-form-item>
        <el-form-item label="院长账号">
          <span>{{ currentInstitution?.director?.username }}</span>
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input
            v-model="passwordForm.new_password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit" :loading="passwordLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getInstitutionList, createInstitution, updateInstitution, deleteInstitution, resetDirectorPassword } from '@/api/institution'

const loading = ref(false)
const submitLoading = ref(false)
const passwordLoading = ref(false)
const institutionList = ref([])
const dialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const passwordFormRef = ref(null)
const currentInstitution = ref(null)

const form = reactive({
  id: null,
  name: '',
  address: '',
  status: 1,
  director_username: '',
  director_password: ''
})

const passwordForm = reactive({
  new_password: ''
})

const rules = {
  name: [{ required: true, message: '请输入院点名称', trigger: 'blur' }],
  director_username: [{ required: true, message: '请输入院长账号', trigger: 'blur' }],
  director_password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }]
}

const passwordRules = {
  new_password: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getInstitutionList()
    institutionList.value = res.data
  } catch (error) {
    console.error('获取院点列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    name: '',
    address: '',
    status: 1,
    director_username: '',
    director_password: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    address: row.address,
    status: row.status,
    director_password: ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateInstitution(form.id, {
        name: form.name,
        address: form.address,
        status: form.status,
        director_password: form.director_password || undefined
      })
      ElMessage.success('更新成功')
    } else {
      await createInstitution({
        name: form.name,
        address: form.address,
        status: form.status,
        director_username: form.director_username,
        director_password: form.director_password
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await deleteInstitution(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '删除失败')
  }
}

const handleResetPassword = (row) => {
  currentInstitution.value = row
  passwordForm.new_password = ''
  passwordDialogVisible.value = true
}

const handlePasswordSubmit = async () => {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return

  passwordLoading.value = true
  try {
    await resetDirectorPassword(currentInstitution.value.id, passwordForm.new_password)
    ElMessage.success('密码重置成功')
    passwordDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '重置失败')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
