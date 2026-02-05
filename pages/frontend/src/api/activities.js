import request from './request'

export const getActivityList = (params) => {
  return request.get('/api/activities', { params })
}

export const getActivityDetail = (id) => {
  return request.get(`/api/activities/${id}`)
}

export const createActivity = (data) => {
  return request.post('/api/activities', data)
}

export const updateActivity = (id, data) => {
  return request.put(`/api/activities/${id}`, data)
}

export const deleteActivity = (id) => {
  return request.delete(`/api/activities/${id}`)
}
