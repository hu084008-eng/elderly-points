import request from './request'

export const getElderlyList = (params) => {
  return request.get('/api/elderly', { params })
}

export const getElderlyByInstitution = (institutionId) => {
  return request.get(`/api/elderly/by-institution/${institutionId}`)
}

export const getElderlyDetail = (id) => {
  return request.get(`/api/elderly/${id}`)
}

export const createElderly = (data) => {
  return request.post('/api/elderly', data)
}

export const updateElderly = (id, data) => {
  return request.put(`/api/elderly/${id}`, data)
}

export const deleteElderly = (id) => {
  return request.delete(`/api/elderly/${id}`)
}
