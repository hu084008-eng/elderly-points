import request from './request'

export const getTransactions = (params) => {
  return request.get('/api/records/transactions', { params })
}

export const getExchanges = (params) => {
  return request.get('/api/records/exchanges', { params })
}

export const getStatistics = (params) => {
  return request.get('/api/records/statistics', { params })
}

export const exportTransactions = (params) => {
  return request.get('/api/records/export/transactions', { 
    params,
    responseType: 'blob'
  })
}

export const exportExchanges = (params) => {
  return request.get('/api/records/export/exchanges', { 
    params,
    responseType: 'blob'
  })
}
