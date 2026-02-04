# 数据库设计文档

## 数据库架构

**数据库名**: `elderly_care`  
**字符集**: `utf8mb4`  
**排序规则**: `utf8mb4_unicode_ci`

## 表结构

### 1. users - 用户表
存储系统登录账号信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| username | VARCHAR(50) | UQ, NN | 登录账号 |
| password_hash | VARCHAR(255) | NN | bcrypt加密密码 |
| role | ENUM | NN | 角色：admin/director |
| name | VARCHAR(50) | | 姓名 |
| phone | VARCHAR(20) | | 电话 |
| institution_id | INT | FK | 院长绑定的院点ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE | 更新时间 |

### 2. institutions - 院点表
存储养老院点信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| name | VARCHAR(50) | NN | 院点名称 |
| address | VARCHAR(200) | | 地址 |
| director_id | INT | FK | 院长用户ID |
| status | TINYINT | DEFAULT 1 | 状态：1启用 0停用 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 3. helpers - 护工表
存储护工信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| institution_id | INT | FK, NN | 所属院点ID |
| name | VARCHAR(50) | NN | 姓名 |
| total_points | INT | DEFAULT 0 | 当前积分余额 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE | 更新时间 |

### 4. elderly - 老人表
存储老人信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| institution_id | INT | FK, NN | 所属院点ID |
| name | VARCHAR(50) | NN | 姓名 |
| total_points | INT | DEFAULT 0 | 当前积分余额 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE | 更新时间 |

### 5. activities - 文娱活动类型表
存储活动类型和积分配置

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| name | VARCHAR(100) | NN | 活动名称 |
| points_per_hour | INT | NN | 每小时积分 |
| status | TINYINT | DEFAULT 1 | 状态：1启用 0停用 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE | 更新时间 |

### 6. products - 商品表
存储积分商品信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| name | VARCHAR(100) | NN | 商品名称 |
| category | ENUM | DEFAULT '日用品' | 分类：清洁用品/食品/日用品/其他 |
| points_price | INT | NN | 兑换所需积分 |
| stock_quantity | INT | DEFAULT 0 | 库存数量 |
| unit | VARCHAR(20) | | 单位 |
| status | TINYINT | DEFAULT 1 | 状态：1上架 0下架 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE | 更新时间 |

### 7. points_transactions - 积分流水表
存储所有积分变动记录

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| institution_id | INT | FK, NN | 所属院点ID |
| target_type | ENUM | NN | 对象类型：helper/elderly |
| target_id | INT | NN | 对象ID |
| target_name | VARCHAR(50) | | 姓名冗余 |
| type | ENUM | NN | 类型：earn赚取/spend消费 |
| amount | INT | NN | 积分值 |
| service_category | VARCHAR(50) | | 服务分类 |
| service_duration | VARCHAR(20) | | 服务时长 |
| calculation_type | ENUM | | 计算类型：fixed固定/dynamic动态 |
| activity_id | INT | FK | 活动ID |
| activity_name | VARCHAR(100) | | 活动名称冗余 |
| points_per_hour | INT | | 每小时积分冗余 |
| description | TEXT | | 备注 |
| image_url | VARCHAR(500) | | 服务照片URL |
| operator_id | INT | | 操作人ID |
| operator_name | VARCHAR(50) | | 操作人姓名 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 8. exchanges - 兑换记录表
存储商品兑换记录

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| institution_id | INT | FK, NN | 所属院点ID |
| target_type | ENUM | NN | 对象类型 |
| target_id | INT | NN | 对象ID |
| target_name | VARCHAR(50) | | 姓名冗余 |
| product_id | INT | FK, NN | 商品ID |
| product_name | VARCHAR(100) | | 商品名冗余 |
| quantity | INT | NN | 数量 |
| unit | VARCHAR(20) | | 单位冗余 |
| total_points | INT | NN | 消耗总积分 |
| status | ENUM | DEFAULT 'completed' | 状态 |
| exchange_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 兑换时间 |
| handler_id | INT | | 操作院长ID |

### 9. system_logs - 系统日志表
存储系统操作日志

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AI | 主键 |
| user_id | INT | | 用户ID |
| username | VARCHAR(50) | | 用户名 |
| action | VARCHAR(50) | NN | 操作类型 |
| module | VARCHAR(50) | | 操作模块 |
| description | TEXT | | 操作描述 |
| ip_address | VARCHAR(50) | | IP地址 |
| user_agent | VARCHAR(500) | | 用户代理 |
| request_data | JSON | | 请求数据 |
| response_status | INT | | 响应状态码 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 关系图

```
users ||--o{ institutions : "院长管理"
institutions ||--o{ helpers : "包含"
institutions ||--o{ elderly : "包含"
institutions ||--o{ points_transactions : "产生"
institutions ||--o{ exchanges : "产生"
activities ||--o{ points_transactions : "参与计算"
products ||--o{ exchanges : "被兑换"
users ||--o{ system_logs : "产生"
```

## 索引设计

```sql
-- 用户表索引
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_institution ON users(institution_id);

-- 护工/老人表索引
CREATE INDEX idx_helpers_institution ON helpers(institution_id);
CREATE INDEX idx_elderly_institution ON elderly(institution_id);

-- 流水表索引
CREATE INDEX idx_transactions_institution ON points_transactions(institution_id);
CREATE INDEX idx_transactions_target ON points_transactions(target_type, target_id);
CREATE INDEX idx_transactions_created ON points_transactions(created_at);

-- 兑换记录表索引
CREATE INDEX idx_exchanges_institution ON exchanges(institution_id);
CREATE INDEX idx_exchanges_date ON exchanges(exchange_date);

-- 系统日志索引
CREATE INDEX idx_logs_user ON system_logs(user_id);
CREATE INDEX idx_logs_action ON system_logs(action);
CREATE INDEX idx_logs_created ON system_logs(created_at);
```

## 数据备份策略

1. **自动备份**: 每天凌晨2点自动备份
2. **备份保留**: 保留最近30天的备份
3. **备份位置**: `./backups/backup_YYYYMMDD_HHMMSS.sql`

## 性能优化建议

1. 定期清理系统日志（保留90天）
2. 对大数据表进行分区
3. 使用读写分离（生产环境）
4. 定期优化表结构
