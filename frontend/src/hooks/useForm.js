import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export function useForm(options = {}) {
  const { initialValues = {}, submitFunction, successMessage = '操作成功', onSuccess } = options

  const formRef = ref(null)
  const loading = ref(false)
  const form = reactive({ ...initialValues })

  const resetForm = () => {
    Object.keys(form).forEach(key => {
      form[key] = initialValues[key] !== undefined ? initialValues[key] : ''
    })
  }

  const submit = async () => {
    const isValid = await formRef.value?.validate().catch(() => false)
    if (!isValid) return false

    loading.value = true
    try {
      const res = await submitFunction(form)
      ElMessage.success(successMessage)
      onSuccess?.(res)
      return res
    } finally {
      loading.value = false
    }
  }

  return { formRef, form, loading, resetForm, submit }
}
