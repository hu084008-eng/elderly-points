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
        <!-- 所属院（院长只能看到本院） -->
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
        <el-form-item label="服务类型" prop="service_category">
          <el-select
            v-model="form.service_category"
            placeholder="请选择服务类型"
            style="width: 100%"
            @change="handleServiceChange"
          >
            <el-option-group label="固定分值服务">
              <el-option label="到院互助" value="到院互助" />
              <el-option label="上门互助" value="上门互助" />
              <el-option label="院内互助" value="院内互助" />
              <el-option label="生产劳动" value="生产劳动" />
            </el-option-group>
            <el-option-group label="活动积分（动态计算）">
              <el-option label="文娱活动 - 每人2分，团队最高20分" value="文娱活动" />
            </el-option-group>
          </el-select>
        </el-form-item>

        <!-- 固定分值：服务时长 -->
        <template v-if="isFixedService">
          <el-form-item label="服务时长" prop="service_duration">
            <el-radio-group v-model="form.service_duration">
              <el-radio label="<2小时">&lt;2小时（1分）</el-radio>
              <el-radio label="≥2小时">≥2小时（2分）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.service_duration">
            <el-alert
              :title="`本次发放：${calculatedPoints}分`"
              type="success"
              :closable="false"
              show-icon
            />
          </el-form-item>
        </template>

        <!-- 文娱活动：活动类型和时长 -->
        <template v-if="isActivityService">
          <el-form-item label="活动类型" prop="activity_id">
            <el-select
              v-model="form.activity_id"
              placeholder="请选择活动类型"
              style="width: 100%"
              @change="handleActivityChange"
            >
              <el-option
                v-for="item in activityList"
                :key="item.id"
                :label="`${item.name}（${item.points_per_hour}分/小时）`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="参与时长" prop="duration_hours">
            <el-input-number
              v-model="form.duration_hours"
              :min="0.5"
              :step="0.5"
              :precision="1"
              style="width: 100%"
              @change="calculateActivityPoints"
            />
            <span class="form-tip">单位：小时，支持0.5小数（如1.5）</span>
          </el-form-item>
          <el-form-item v-if="selectedActivity && form.duration_hours">
            <el-alert
              :title="activityPointsText"
              type="success"
              :closable="false"
              show-icon
            />
          </el-form-item>
        </template>

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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getInstitutionList } from '@/api/institution'
import { getActivityList } from '@/api/activities'
import { getPersons, grantPoints } from '@/api/grant'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const personLoading = ref(false)

const institutionList = ref([])
const personList = ref([])
const activityList = ref([])
const selectedActivity = ref(null)

const form = reactive({
  institution_id: userStore.isDirector ? userStore.userInstitution?.id : '',
  target_type: '',
  target_id: '',
  service_category: '',
  service_duration: '',
  activity_id: null,
  duration_hours: null,
  description: '',
  image_url: ''
})

const rules = {
  institution_id: [{ required: true, message: '请选择所属院', trigger: 'change' }],
  target_type: [{ required: true, message: '请选择人员类型', trigger: 'change' }],
  target_id: [{ required: true, message: '请选择具体人员', trigger: 'change' }],
  service_category: [{ required: true, message: '请选择服务类型', trigger: 'change' }],
  service_duration: [{ required: true, message: '请选择服务时长', trigger: 'change' }],
  activity_id: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  duration_hours: [{ required: true, message: '请输入参与时长', trigger: 'blur' }],
  image_url: [{ required: true, message: '请上传服务照片', trigger: 'change' }]
}

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

// 可选院点列表（所有人都可以选择任意院）
const availableInstitutions = computed(() => {
  return institutionList.value
})

const isFixedService = computed(() => {
  return form.service_category && form.service_category !== '文娱活动'
})

const isActivityService = computed(() => {
  return form.service_category === '文娱活动'
})

const calculatedPoints = computed(() => {
  if (!form.service_duration) return 0
  return form.service_duration === '<2小时' ? 1 : 2
})

const activityPoints = computed(() => {
  if (!selectedActivity.value || !form.duration_hours) return 0
  return Math.round(form.duration_hours * selectedActivity.value.points_per_hour)
})

const activityPointsText = computed(() => {
  if (!selectedActivity.value || !form.duration_hours) return ''
  return `${form.duration_hours}小时 × ${selectedActivity.value.points_per_hour}分/小时 = ${activityPoints.value}分`
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
const handleServiceChange = () => {
  form.service_duration = ''
  form.activity_id = null
  form.duration_hours = null
  selectedActivity.value = null
}

// 活动类型改变
const handleActivityChange = (val) => {
  selectedActivity.value = activityList.value.find(a => a.id === val)
}

const calculateActivityPoints = () => {
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

const fetchActivities = async () => {
  try {
    const res = await getActivityList({ status: 1 })
    activityList.value = res.data
  } catch (error) {
    console.error('获取活动列表失败:', error)
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
        const submitData = { ...form }
        
        // 根据服务类型处理数据
        if (isActivityService.value) {
          submitData.service_duration = null
        } else {
          submitData.activity_id = null
          submitData.duration_hours = null
        }
        
        const res = await grantPoints(submitData)
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
  form.service_category = ''
  form.service_duration = ''
  form.activity_id = null
  form.duration_hours = null
  form.description = ''
  form.image_url = ''
  personList.value = []
  selectedActivity.value = null
}

onMounted(() => {
  if (userStore.isAdmin) {
    fetchInstitutions()
  } else {
    institutionList.value = [userStore.userInstitution]
  }
  fetchActivities()
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
