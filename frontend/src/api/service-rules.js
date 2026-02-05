import request from './request'

// 获取所有服务规则
export const getServiceRuleList = () => {
  return request.get('/api/service-rules')
}

// 获取单个规则
export const getServiceRule = (id) => {
  return request.get(`/api/service-rules/${id}`)
}

// 创建规则
export const createServiceRule = (data) => {
  return request.post('/api/service-rules', data)
}

// 更新规则
export const updateServiceRule = (id, data) => {
  return request.put(`/api/service-rules/${id}`, data)
}

// 删除规则
export const deleteServiceRule = (id) => {
  return request.delete(`/api/service-rules/${id}`)
}
