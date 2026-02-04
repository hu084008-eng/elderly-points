import request from './request'

export const getPersons = (params) => {
  return request.get('/api/grant/persons', { params })
}

export const grantPoints = (data) => {
  return request.post('/api/grant', data)
}
