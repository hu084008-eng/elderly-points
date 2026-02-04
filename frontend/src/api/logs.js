import request from './request'

export const getLogList = (params) => {
  return request.get('/api/logs', { params })
}

export const getLogStatistics = (params) => {
  return request.get('/api/logs/statistics', { params })
}

export const cleanupLogs = (data) => {
  return request.post('/api/logs/cleanup', data)
}
