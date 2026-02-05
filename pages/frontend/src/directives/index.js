import { ElMessage } from 'element-plus'

export const debounce = {
  mounted(el, binding) {
    let timer = null
    el.addEventListener('click', () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => binding.value(), binding.arg || 300)
    })
  }
}

export const throttle = {
  mounted(el, binding) {
    let lastTime = 0
    el.addEventListener('click', () => {
      const now = Date.now()
      if (now - lastTime > (binding.arg || 1000)) {
        lastTime = now
        binding.value()
      }
    })
  }
}

export const copy = {
  mounted(el, binding) {
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(binding.value).then(() => {
        ElMessage.success('复制成功')
      }).catch(() => ElMessage.error('复制失败'))
    })
  }
}

export function setupDirectives(app) {
  app.directive('debounce', debounce)
  app.directive('throttle', throttle)
  app.directive('copy', copy)
}
