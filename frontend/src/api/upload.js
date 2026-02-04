import request from './request'

export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
