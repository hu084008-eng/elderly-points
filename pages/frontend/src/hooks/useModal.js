import { ref } from 'vue'

export function useModal(options = {}) {
  const { onOpen, onClose } = options

  const visible = ref(false)
  const data = ref(null)

  const open = (modalData = null) => {
    data.value = modalData
    visible.value = true
    onOpen?.(modalData)
  }

  const close = () => {
    visible.value = false
    data.value = null
    onClose?.()
  }

  return { visible, data, open, close }
}
