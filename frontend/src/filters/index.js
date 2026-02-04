import dayjs from 'dayjs'

export function formatDate(value, format = 'YYYY-MM-DD') {
  if (!value) return '-'
  return dayjs(value).format(format)
}

export function formatDateTime(value) {
  if (!value) return '-'
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '-'
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatPoints(value) {
  if (value === null || value === undefined) return '-'
  return formatNumber(value) + ' 分'
}

export function truncate(value, length = 50) {
  if (!value) return '-'
  if (value.length <= length) return value
  return value.substring(0, length) + '...'
}

export function setupFilters(app) {
  app.config.globalProperties.$filters = {
    formatDate,
    formatDateTime,
    formatNumber,
    formatPoints,
    truncate
  }
}
