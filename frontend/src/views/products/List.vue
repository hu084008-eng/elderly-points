<template>
  <div class="products-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增商品
          </el-button>
        </div>
      </template>

      <el-table :data="productList" border v-loading="loading">
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="points_price" label="兑换积分" width="100">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.points_price }}分</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock_quantity" label="库存" width="100">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.stock_quantity <= 5 }">
              {{ row.stock_quantity }}
              <el-tag v-if="row.stock_quantity <= 5" type="danger" size="small">库存不足</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
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
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="清洁用品" value="清洁用品" />
            <el-option label="食品" value="食品" />
            <el-option label="日用品" value="日用品" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="兑换积分" prop="points_price">
          <el-input-number v-model="form.points_price" :min="1" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock_quantity">
          <el-input-number v-model="form.stock_quantity" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" placeholder="请选择单位" style="width: 100%">
            <el-option label="瓶" value="瓶" />
            <el-option label="袋" value="袋" />
            <el-option label="提" value="提" />
            <el-option label="个" value="个" />
            <el-option label="块" value="块" />
            <el-option label="盒" value="盒" />
            <el-option label="双" value="双" />
            <el-option label="条" value="条" />
            <el-option label="支" value="支" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
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
import { getProductList, createProduct, updateProduct, deleteProduct } from '@/api/products'

const loading = ref(false)
const productList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = reactive({
  name: '',
  category: '日用品',
  points_price: 10,
  stock_quantity: 0,
  unit: '个',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  points_price: [{ required: true, message: '请输入兑换积分', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProductList()
    productList.value = res.data
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.name = ''
  form.category = '日用品'
  form.points_price = 10
  form.stock_quantity = 0
  form.unit = '个'
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.name = row.name
  form.category = row.category
  form.points_price = row.points_price
  form.stock_quantity = row.stock_quantity
  form.unit = row.unit
  form.status = row.status
  dialogVisible.value = true
}

const handleStatusChange = async (row) => {
  try {
    await updateProduct(row.id, { status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除商品【${row.name}】吗？`, '提示', {
      type: 'warning'
    })
    await deleteProduct(row.id)
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
          await updateProduct(currentId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createProduct(form)
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

.text-danger {
  color: #f56c6c;
}
</style>
