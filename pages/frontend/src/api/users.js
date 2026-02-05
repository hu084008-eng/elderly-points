import request from './request'

export const getUserList = (params) => {
  return request.get('/api/users', { params })
}

export const getUserDetail = (id) => {
  return request.get(`/api/users/${id}`)
}

export const createUser = (data) => {
  return request.post('/api/users', data)
}

export const updateUser = (id, data) => {
  return request.put(`/api/users/${id}`, data)
}

export const deleteUser = (id) => {
  return request.delete(`/api/users/${id}`)
}

export const resetPassword = (id, data) => {
  return request.post(`/api/users/${id}/reset-password`, data)
}
