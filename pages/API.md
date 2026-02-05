# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token
- **Content-Type**: `application/json`

## 认证接口

### 登录
```http
POST /auth/login
```

**请求参数**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "name": "总部管理员"
    }
  }
}
```

### 获取当前用户信息
```http
GET /auth/me
Authorization: Bearer {token}
```

### 修改密码
```http
POST /auth/change-password
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

## 用户管理

### 获取用户列表
```http
GET /users?role=director&page=1&page_size=20
Authorization: Bearer {token}
```

### 创建用户
```http
POST /users
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "username": "director_new",
  "password": "123456",
  "role": "director",
  "name": "新院长",
  "phone": "13800138000",
  "institution_id": 1
}
```

### 更新用户
```http
PUT /users/:id
Authorization: Bearer {token}
```

### 删除用户
```http
DELETE /users/:id
Authorization: Bearer {token}
```

### 重置密码
```http
POST /users/:id/reset-password
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "new_password": "新密码"
}
```

## 院点管理

### 获取院点列表
```http
GET /institutions
Authorization: Bearer {token}
```

### 创建院点
```http
POST /institutions
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "新院点",
  "address": "地址",
  "status": 1
}
```

## 文娱活动

### 获取活动列表
```http
GET /activities?status=1
Authorization: Bearer {token}
```

### 创建活动
```http
POST /activities
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "舞蹈表演",
  "points_per_hour": 2,
  "status": 1
}
```

## 商品管理

### 获取商品列表
```http
GET /products?status=1&category=日用品
Authorization: Bearer {token}
```

### 创建商品
```http
POST /products
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "洗衣液",
  "category": "清洁用品",
  "points_price": 15,
  "stock_quantity": 100,
  "unit": "瓶",
  "status": 1
}
```

## 护工/老人管理

### 获取列表
```http
GET /helpers?keyword=张
GET /elderly?keyword=李
Authorization: Bearer {token}
```

### 创建
```http
POST /helpers
POST /elderly
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "institution_id": 1,
  "name": "张三"
}
```

### 根据院点获取
```http
GET /helpers/by-institution/:institutionId
GET /elderly/by-institution/:institutionId
Authorization: Bearer {token}
```

## 积分发放

### 获取人员列表（级联选择）
```http
GET /grant/persons?institution_id=1&type=helper
Authorization: Bearer {token}
```

### 发放积分
```http
POST /grant
Authorization: Bearer {token}
```

**固定分值服务**:
```json
{
  "institution_id": 1,
  "target_type": "helper",
  "target_id": 1,
  "service_category": "到院互助",
  "service_duration": "≥2小时",
  "description": "为老人理发",
  "image_url": "/uploads/xxx.jpg"
}
```

**文娱活动**:
```json
{
  "institution_id": 1,
  "target_type": "elderly",
  "target_id": 2,
  "service_category": "文娱活动",
  "activity_id": 1,
  "duration_hours": 1.5,
  "description": "参加舞蹈表演",
  "image_url": "/uploads/xxx.jpg"
}
```

## 积分兑换

### 提交兑换
```http
POST /exchange
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "target_type": "helper",
  "target_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

## 记录查询

### 积分流水
```http
GET /records/transactions?type=earn&start_date=2024-01-01&end_date=2024-01-31&page=1&page_size=20
Authorization: Bearer {token}
```

### 兑换记录
```http
GET /records/exchanges?start_date=2024-01-01&page=1&page_size=20
Authorization: Bearer {token}
```

### 统计数据
```http
GET /records/statistics?institution_id=1&start_date=2024-01-01
Authorization: Bearer {token}
```

### 导出Excel
```http
GET /records/export/transactions?start_date=2024-01-01
GET /records/export/exchanges?start_date=2024-01-01
Authorization: Bearer {token}
```

## 系统日志

### 获取日志列表
```http
GET /logs?action=新增&module=商品&page=1&page_size=20
Authorization: Bearer {token}
```

### 获取日志统计
```http
GET /logs/statistics
Authorization: Bearer {token}
```

### 清理旧日志
```http
POST /logs/cleanup
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "days": 30
}
```

## 文件上传

### 上传图片
```http
POST /upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
- `file`: 图片文件 (JPG/PNG, max 5MB)

**响应**:
```json
{
  "code": 200,
  "data": {
    "url": "/uploads/service-xxx.jpg",
    "filename": "service-xxx.jpg"
  }
}
```

## 健康检查

### 健康状态
```http
GET /health
```

### 系统状态
```http
GET /health/status
```

### 缓存状态
```http
GET /health/cache
Authorization: Bearer {token}
```

## 响应码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 参数错误 |
| 401 | 未授权/Token过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 错误响应格式

```json
{
  "code": 500,
  "message": "错误描述",
  "timestamp": 1706963200000
}
```
