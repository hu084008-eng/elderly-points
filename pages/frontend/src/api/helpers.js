import request from './request'

export const getHelperList = (params) => {
  return request.get('/api/helpers', { params })
}

export const getHelpersByInstitution = (institutionId) => {
  return request.get(`/api/helpers/by-institution/${institutionId}`)
}

export const getHelperDetail = (id) => {
  return request.get(`/api/helpers/${id}`)
}

export const createHelper = (data) => {
  return request.post('/api/helpers', data)
}

export const updateHelper = (id, data) => {
  return request.put(`/api/helpers/${id}`, data)
}

export const deleteHelper = (id) => {
  return request.delete(`/api/helpers/${id}`)
}
