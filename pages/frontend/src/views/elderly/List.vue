<template>
  <div class="elderly-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>老人管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增老人
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item label="所属院" v-if="userStore.isAdmin">
          <el-select v-model="searchForm.institution_id" placeholder="全部" clearable>
            <el-option
              v-for="item in institutionList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="elderlyList" border v-loading="loading">
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="institution_id" label="所属院">
          <template #default="{ row }">
            {{ getInstitutionName(row.institution_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_points" label="当前积分" width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.total_points }}分</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
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
      :title="isEdit ? '编辑老人' : '新增老人'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="所属院" prop="institution_id" v-if="userStore.isAdmin">
          <el-select v-model="form.institution_id" placeholder="请选择院点" style="width: 100%">
            <el-option
              v-for="item in institutionList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属院" v-else>
          <el-input :value="userStore.userInstitution?.name" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
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
import dayjs from 'dayjs'
import { useUserStore } from '@/store/user'
import { getInstitutionList } from '@/api/institution'
import { getElderlyList, createElderly, updateElderly, deleteElderly } from '@/api/elderly'

const userStore = useUserStore()

const loading = ref(false)
const elderlyList = ref([])
const institutionList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const searchForm = reactive({
  institution_id: '',
  keyword: ''
})

const form = reactive({
  institution_id: userStore.isDirector ? userStore.userInstitution?.id : '',
  name: ''
})

const rules = {
  institution_id: [{ required: true, message: '请选择所属院', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const getInstitutionName = (id) => {
  const inst = institutionList.value.find(i => i.id === id)
  return inst?.name || '-'
}

const fetchInstitutions = async () => {
  try {
    const res = await getInstitutionList()
    institutionList.value = res.data
  } catch (error) {
    console.error('获取院点失败:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }
    const res = await getElderlyList(params)
    elderlyList.value = res.data
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchData()
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.institution_id = userStore.isDirector ? userStore.userInstitution?.id : ''
  form.name = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.institution_id = row.institution_id
  form.name = row.name
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除老人【${row.name}】吗？`, '提示', {
      type: 'warning'
    })
    await deleteElderly(row.id)
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
        const submitData = { ...form }
        if (userStore.isDirector) {
          submitData.institution_id = userStore.userInstitution?.id
        }
        
        if (isEdit.value) {
          await updateElderly(currentId.value, submitData)
          ElMessage.success('更新成功')
        } else {
          await createElderly(submitData)
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
  if (userStore.isAdmin) {
    fetchInstitutions()
  }
  fetchData()
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
</style>
