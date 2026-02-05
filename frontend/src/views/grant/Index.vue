<template>
  <div class="grant-page">
    <el-card>
      <template #header>
        <span>积分发放</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px"
      >
        <!-- 所属院 -->
        <el-form-item label="所属院" prop="institution_id">
          <el-select
            v-model="form.institution_id"
            placeholder="请选择院点"
            style="width: 100%"
            @change="handleInstitutionChange"
            :disabled="userStore.isDirector"
          >
            <el-option
              v-for="item in availableInstitutions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 人员类型 -->
        <el-form-item label="人员类型" prop="target_type">
          <el-select
            v-model="form.target_type"
            placeholder="请选择人员类型"
            style="width: 100%"
            @change="handleTypeChange"
          >
            <el-option label="护工" value="helper" />
            <el-option label="老人" value="elderly" />
          </el-select>
        </el-form-item>

        <!-- 具体人员 -->
        <el-form-item label="具体人员" prop="target_id">
          <el-select
            v-model="form.target_id"
            placeholder="请选择人员"
            style="width: 100%"
            :disabled="!form.institution_id || !form.target_type || personLoading"
            :loading="personLoading"
          >
            <el-option
              v-for="item in personList"
              :key="item.id"
              :label="item.display_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 服务类型 -->
        <el-form-item label="服务类型" prop="service_rule_id">
          <el-select
            v-model="form.service_rule_id"
            placeholder="请选择服务类型"
            style="width: 100%"
            @change="handleServiceChange"
          >
            <el-option
              v-for="item in serviceRuleList"
              :key="item.id"
              :label="`${item.name}（${item.points_per_hour}分/小时）`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 服务时长 -->
        <el-form-item label="服务时长" prop="duration_hours">
          <el-input-number
            v-model="form.duration_hours"
            :min="0.5"
            :step="0.5"
            :precision="1"
            style="width: 100%"
            @change="calculatePoints"
          />
          <span class="form-tip">单位：小时，支持0.5小数（如1.5）</span>
        </el-form-item>

        <!-- 积分预览 -->
        <el-form-item v-if="selectedRule && form.duration_hours">
          <el-alert
            :title="pointsText"
            type="success"
            :closable="false"
            show-icon
          />
        </el-form-item>

        <!-- 服务照片 -->
        <el-form-item label="服务照片" prop="image_url">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
          >
            <img v-if="form.image_url" :src="form.image_url" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <span class="form-tip">请上传JPG/PNG格式，大小不超过5MB</span>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="如：为张三理发"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确认发放
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getInstitutionList } from '@/api/institution'
import { getServiceRuleList } from '@/api/service-rules'
import { getPersons, grantPoints } from '@/api/grant'

const userStore = useUserStore()
const formRef = ref(null)
const submitLoading = ref(false)
const personLoading = ref(false)

const institutionList = ref([])
const personList = ref([])
const serviceRuleList = ref([])
const selectedRule = ref(null)

const form = reactive({
  institution_id: userStore.isDirector ? userStore.userInstitution?.id : '',
  target_type: '',
  target_id: '',
  service_rule_id: null,
  duration_hours: null,
  description: '',
  image_url: ''
})

const rules = {
  institution_id: [{ required: true, message: '请选择所属院', trigger: 'change' }],
  target_type: [{ required: true, message: '请选择人员类型', trigger: 'change' }],
  target_id: [{ required: true, message: '请选择具体人员', trigger: 'change' }],
  service_rule_id: [{ required: true, message: '请选择服务类型', trigger: 'change' }],
  duration_hours: [{ required: true, message: '请输入服务时长', trigger: 'blur' }],
  image_url: [{ required: true, message: '请上传服务照片', trigger: 'change' }]
}

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

const availableInstitutions = computed(() => {
  return institutionList.value
})

const totalPoints = computed(() => {
  if (!selectedRule.value || !form.duration_hours) return 0
  return Math.round(form.duration_hours * selectedRule.value.points_per_hour)
})

const pointsText = computed(() => {
  if (!selectedRule.value || !form.duration_hours) return ''
  return `${form.duration_hours}小时 × ${selectedRule.value.points_per_hour}分/小时 = ${totalPoints.value}分`
})

// 级联：院点改变
const handleInstitutionChange = () => {
  form.target_id = ''
  personList.value = []
  if (form.institution_id && form.target_type) {
    fetchPersons()
  }
}

// 级联：人员类型改变
const handleTypeChange = () => {
  form.target_id = ''
  personList.value = []
  if (form.institution_id && form.target_type) {
    fetchPersons()
  }
}

// 服务类型改变
const handleServiceChange = (val) => {
  selectedRule.value = serviceRuleList.value.find(r => r.id === val)
}

const calculatePoints = () => {
  // 计算逻辑在computed中
}

const fetchInstitutions = async () => {
  try {
    const res = await getInstitutionList()
    institutionList.value = res.data
  } catch (error) {
    console.error('获取院点失败:', error)
  }
}

const fetchServiceRules = async () => {
  try {
    const res = await getServiceRuleList()
    serviceRuleList.value = res.data
  } catch (error) {
    console.error('获取服务规则失败:', error)
  }
}

const fetchPersons = async () => {
  if (!form.institution_id || !form.target_type) return
  
  personLoading.value = true
  try {
    const res = await getPersons({
      institution_id: form.institution_id,
      type: form.target_type
    })
    personList.value = res.data
  } finally {
    personLoading.value = false
  }
}

const handleUploadSuccess = (res) => {
  form.image_url = res.data.url
  ElMessage.success('上传成功')
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isJpgOrPng) {
    ElMessage.error('只支持JPG/PNG格式!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await grantPoints(form)
        ElMessage.success(`发放成功，${res.data.target_name}当前积分余额为${res.data.current_balance}分`)
        handleReset()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
  form.institution_id = userStore.isDirector ? userStore.userInstitution?.id : ''
  form.target_type = ''
  form.target_id = ''
  form.service_rule_id = null
  form.duration_hours = null
  form.description = ''
  form.image_url = ''
  personList.value = []
  selectedRule.value = null
}

onMounted(() => {
  if (userStore.isAdmin) {
    fetchInstitutions()
  } else {
    institutionList.value = [userStore.userInstitution]
  }
  fetchServiceRules()
})
</script>

<style scoped>
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  display: block;
}
</style>
