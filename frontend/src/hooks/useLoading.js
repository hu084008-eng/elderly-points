import { ref } from 'vue'

export function useLoading() {
  const loading = ref(false)
  const error = ref(null)

  const run = async (asyncFunction, ...args) => {
    loading.value = true
    error.value = null
    try {
      return await asyncFunction(...args)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, error, run }
}
