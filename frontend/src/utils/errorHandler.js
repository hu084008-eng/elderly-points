import { ElMessage, ElNotification } from 'element-plus'

export function handleError(error, options = {}) {
  const { silent = false, notification = false } = options
  
  let message = '操作失败'
  
  if (error.response) {
    const { status, data } = error.response
    message = data?.message || `请求失败 (${status})`
    
    switch (status) {
      case 401:
        message = '登录已过期，请重新登录'
        break
      case 403:
        message = '权限不足'
        break
      case 404:
        message = '请求的资源不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
    }
  } else if (error.request) {
    message = '网络错误，请检查网络连接'
  } else {
    message = error.message || '未知错误'
  }
  
  if (!silent) {
    if (notification) {
      ElNotification.error({ title: '错误', message })
    } else {
      ElMessage.error(message)
    }
  }
  
  console.error('Error:', error)
  return message
}

export function handleSuccess(message) {
  ElMessage.success(message)
}
