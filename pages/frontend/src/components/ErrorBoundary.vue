<template>
  <div v-if="hasError" class="error-boundary">
    <el-result
      icon="error"
      title="页面出错了"
      :sub-title="errorMessage"
    >
      <template #extra>
        <el-button type="primary" @click="handleRetry">重新加载</el-button>
        <el-button @click="handleGoHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error) => {
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  console.error('Error captured:', error)
  return false
})

const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
  location.reload()
}

const handleGoHome = () => {
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  padding: 40px;
}
</style>
