import request from './request'

export const getInstitutionList = (params) => {
  return request.get('/api/institutions', { params })
}

export const getInstitutionDetail = (id) => {
  return request.get(`/api/institutions/${id}`)
}

export const createInstitution = (data) => {
  return request.post('/api/institutions', data)
}

export const updateInstitution = (id, data) => {
  return request.put(`/api/institutions/${id}`, data)
}

export const deleteInstitution = (id) => {
  return request.delete(`/api/institutions/${id}`)
}

export const resetDirectorPassword = (id, new_password) => {
  return request.post(`/api/institutions/${id}/reset-password`, { new_password })
}
