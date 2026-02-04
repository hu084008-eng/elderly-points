import request from './request'

export const getProductList = (params) => {
  return request.get('/api/products', { params })
}

export const getProductDetail = (id) => {
  return request.get(`/api/products/${id}`)
}

export const createProduct = (data) => {
  return request.post('/api/products', data)
}

export const updateProduct = (id, data) => {
  return request.put(`/api/products/${id}`, data)
}

export const deleteProduct = (id) => {
  return request.delete(`/api/products/${id}`)
}
