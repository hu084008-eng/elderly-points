/**
 * 表单验证工具函数
 */

// 手机号验证
export function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 身份证验证（简化版）
export function isValidIdCard(idCard) {
  return /^\d{17}[\dXx]$/.test(idCard)
}

// 邮箱验证
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 非空验证
export function isRequired(value) {
  return value !== null && value !== undefined && value.toString().trim() !== ''
}

// 数字验证
export function isNumber(value) {
  return !isNaN(Number(value))
}

// 正整数验证
export function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(value)
}

// 金额验证（最多两位小数）
export function isValidAmount(value) {
  return /^\d+(\.\d{1,2})?$/.test(value)
}

// 长度验证
export function isValidLength(value, min, max) {
  const len = value.toString().length
  return len >= min && len <= max
}

// 验证规则生成器
export function createValidator(rules) {
  return (values) => {
    const errors = {}
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        const value = values[field]
        
        if (rule.required && !isRequired(value)) {
          errors[field] = rule.message || `${field}不能为空`
          break
        }
        
        if (isRequired(value)) {
          if (rule.type === 'phone' && !isValidPhone(value)) {
            errors[field] = rule.message || '手机号格式错误'
            break
          }
          
          if (rule.type === 'email' && !isValidEmail(value)) {
            errors[field] = rule.message || '邮箱格式错误'
            break
          }
          
          if (rule.type === 'number' && !isNumber(value)) {
            errors[field] = rule.message || '必须是数字'
            break
          }
          
          if (rule.min !== undefined && Number(value) < rule.min) {
            errors[field] = rule.message || `最小值为${rule.min}`
            break
          }
          
          if (rule.max !== undefined && Number(value) > rule.max) {
            errors[field] = rule.message || `最大值为${rule.max}`
            break
          }
          
          if (rule.minLength && value.length < rule.minLength) {
            errors[field] = rule.message || `最少${rule.minLength}个字符`
            break
          }
          
          if (rule.maxLength && value.length > rule.maxLength) {
            errors[field] = rule.message || `最多${rule.maxLength}个字符`
            break
          }
          
          if (rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.message || '格式错误'
            break
          }
          
          if (rule.validator && typeof rule.validator === 'function') {
            const result = rule.validator(value, values)
            if (result !== true) {
              errors[field] = result || rule.message || '验证失败'
              break
            }
          }
        }
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
}
