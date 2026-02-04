import { ref, reactive } from 'vue'

export function useTable(fetchFunction, options = {}) {
  const { defaultPage = 1, defaultPageSize = 20, immediate = true } = options

  const loading = ref(false)
  const data = ref([])
  const pagination = reactive({
    page: defaultPage,
    page_size: defaultPageSize,
    total: 0,
    total_pages: 0
  })

  const query = reactive({})

  const fetchData = async () => {
    loading.value = true
    try {
      const params = { ...query, page: pagination.page, page_size: pagination.page_size }
      const res = await fetchFunction(params)
      data.value = res.data.list || res.data
      if (res.data.pagination) {
        Object.assign(pagination, res.data.pagination)
      }
      return res
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val) => {
    pagination.page_size = val
    pagination.page = 1
    fetchData()
  }

  const handleCurrentChange = (val) => {
    pagination.page = val
    fetchData()
  }

  if (immediate) {
    fetchData()
  }

  return { loading, data, pagination, query, fetchData, handleSizeChange, handleCurrentChange }
}
