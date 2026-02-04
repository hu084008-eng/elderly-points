import request from './request'

export const exchange = (data) => {
  return request.post('/api/exchange', data)
}
