import request from './request'

export const login = (data) => {
  return request.post('/api/auth/login', data)
}

export const getUserInfo = () => {
  return request.get('/api/auth/me')
}

export const changePassword = (data) => {
  return request.post('/api/auth/change-password', data)
}
