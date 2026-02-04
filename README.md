# 农村互助养老积分超市管理系统

基于 Vue3 + Node.js + MySQL 的全栈项目，采用 Docker Compose 一键部署架构。

## 系统架构

| 层级 | 技术栈 |
|------|--------|
| 前端 | Vue3 + Element Plus + Vite |
| 后端 | Node.js + Express + Sequelize ORM |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose（三容器架构） |

## 功能模块

### 账号与权限体系

| 角色 | 权限范围 |
|------|----------|
| 总部管理员 | 所有院点、创建院长账号、商品库管理、文娱活动管理、全局报表 |
| 院长 | 仅本院、护工/老人管理、积分发放、积分兑换、本院报表 |

### 核心业务

- **积分发放**：支持服务积分固定分值和文娱活动动态计算
- **积分兑换**：收银台模式，购物车汇总，实时校验余额和库存
- **商品管理**：17种商品，库存预警（≤5时红色高亮）
- **人员管理**：护工、老人极简信息管理（仅姓名+积分）
- **流水查询**：积分交易记录、兑换记录、数据统计
- **数据导出**：支持Excel导出积分流水和兑换记录
- **统计图表**：积分趋势图、商品兑换分布图

## 快速开始

### 环境要求

- Docker >= 20.0
- Docker Compose >= 2.0

### 部署步骤

#### 方式一：使用部署脚本（推荐）

```bash
cd 养老积分超市
bash deploy.sh
```

#### 方式二：手动部署

```bash
cd 养老积分超市

# 环境检查
node check-env.js

# 构建并启动
docker-compose up -d --build
```

3. 等待初始化（约30秒）

4. 访问系统
- 管理后台：http://localhost
- 后端API：http://localhost:3000

### 默认账号

| 账号 | 密码 | 角色 | 所属院点 |
|------|------|------|----------|
| admin | 123456 | 总部管理员 | 全部 |
| lihe_yz | 123456 | 李河院长 | 李河院 |
| wuling_yz | 123456 | 武陵院长 | 武陵院 |
| ganning_yz | 123456 | 甘宁院长 | 甘宁院 |

**注意**：每个院长账号只能查看和管理本院的数据，各院之间完全独立。

## 项目结构

```
├── docker-compose.yml      # Docker Compose配置
├── init.sql                # 数据库初始化脚本
├── backend/                # 后端项目
│   ├── src/
│   │   ├── app.js          # Express入口
│   │   ├── config/         # 数据库配置
│   │   ├── models/         # Sequelize模型
│   │   ├── routes/         # API路由
│   │   └── middleware/     # 中间件（JWT、权限检查）
│   └── uploads/            # 上传文件目录
└── frontend/               # 前端项目
    ├── src/
    │   ├── api/            # API接口封装
    │   ├── views/          # 页面组件
    │   ├── router/         # 路由配置
    │   └── store/          # Pinia状态管理
    └── nginx.conf          # Nginx配置
```

## 积分规则

### 一、服务积分

| 服务类型 | 适用对象 | 积分标准 |
|---------|---------|---------|
| **到院互助服务** | 邻里互助员到敬老院/养老服务中心为院内老人提供互助服务 | 每次服务积1分，单次服务时长超过2小时的积2分 |
| **上门互助服务** | 邻里互助员为村/社区独居、失能老人提供上门互助服务 | 每次服务积1分，单次服务时长超过2小时的积2分 |
| **院内互助服务** | 院内低龄老人服务高龄老人，健康老人服务失能老人 | 一般每天积1分，服务效果较好的每天积2分 |
| **生产劳动** | 参与生产劳动 | 按实际贡献评定 |

### 二、活动积分

| 活动类型 | 积分标准 |
|---------|---------|
| **文娱活动** | 社会公益团队到院为老人开展各类文艺表演活动，参演团队人员每人积2分（可转为团队积分，团队积分一次性最高不超过20分，同一人员不同团队不重复积分） |

### 三、积分兑换

- 积分可在积分超市兑换商品
- 兑换时实时扣除积分余额
- 支持兑换记录查询

## API接口文档

### 认证相关
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/change-password` - 修改密码

### 用户管理（管理员）
- `GET /api/users` - 用户列表
- `POST /api/users` - 创建用户/院长账号
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `POST /api/users/:id/reset-password` - 重置密码

### 院点管理
- `GET /api/institutions` - 院点列表
- `POST /api/institutions` - 创建院点
- `PUT /api/institutions/:id` - 更新院点
- `DELETE /api/institutions/:id` - 删除院点

### 文娱活动
- `GET /api/activities` - 活动列表
- `POST /api/activities` - 创建活动
- `PUT /api/activities/:id` - 更新活动
- `DELETE /api/activities/:id` - 删除活动

### 商品管理
- `GET /api/products` - 商品列表
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

### 护工/老人管理
- `GET /api/helpers` - 护工列表
- `POST /api/helpers` - 创建护工
- `GET /api/elderly` - 老人列表
- `POST /api/elderly` - 创建老人

### 积分发放
- `GET /api/grant/persons` - 获取人员列表（级联选择）
- `POST /api/grant` - 发放积分

### 积分兑换
- `POST /api/exchange` - 提交兑换

### 记录查询
- `GET /api/records/transactions` - 积分流水
- `GET /api/records/exchanges` - 兑换记录
- `GET /api/records/statistics` - 统计数据

### 文件上传
- `POST /api/upload` - 上传服务照片

## 数据库表结构

| 表名 | 说明 |
|------|------|
| users | 账号表（管理员、院长） |
| institutions | 院点表 |
| helpers | 护工表 |
| elderly | 老人表 |
| activities | 文娱活动类型表 |
| products | 商品表 |
| points_transactions | 积分流水表 |
| exchanges | 兑换记录表 |

## 关键业务规则

### 积分计算规则

1. **固定分值服务**
   - < 2小时：1分
   - ≥ 2小时：2分

2. **文娱活动**
   - 计算公式：时长（小时）× 每小时积分
   - 支持0.5小时精度

### 权限控制

- 院长只能查看/操作本院数据
- 所有列表数据自动根据 `institution_id` 过滤
- API层校验目标人员是否属于本院

### 事务完整性

- 积分发放：更新余额 + 插入流水（事务）
- 积分兑换：验证库存→扣减库存→扣减积分→插入记录（事务）

## 开发环境运行

### 后端
```bash
cd backend
npm install
npm run dev
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

## 生产环境部署

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

## 常见问题

### 1. 数据库连接失败
- 检查MySQL容器是否正常运行
- 确认环境变量配置正确

### 2. 前端无法访问API
- 检查Nginx配置中的代理设置
- 确认后端服务是否正常运行

### 3. 照片上传失败
- 检查 `uploads` 目录权限
- 确认文件大小不超过5MB

## 技术亮点

- ✅ Docker Compose 一键部署
- ✅ JWT 身份认证
- ✅ 角色权限控制（RBAC）
- ✅ 数据库事务处理
- ✅ 级联选择组件
- ✅ 实时积分计算
- ✅ 库存预警提示
- ✅ 数据隔离（院长只能看本院）

## 项目截图

### 登录页面
简洁的登录界面，支持管理员和院长两种角色

### 仪表盘
- 统计数据卡片展示
- 积分趋势折线图
- 商品兑换分布饼图
- 快捷操作入口

### 积分发放
- 三级级联选择（院点→类型→人员）
- 服务类型分组下拉
- 动态积分计算
- 照片上传验证

### 积分兑换
- 人员选择区
- 商品网格展示
- 购物车汇总
- 余额实时校验

### 流水查询
- 多条件筛选
- 分页展示
- Excel导出

## 更新日志

### v1.0.0 (2026-02-03)
- ✅ 初始版本发布
- ✅ 完整的积分发放/兑换流程
- ✅ 管理员/院长权限体系
- ✅ Excel导出功能
- ✅ 统计图表展示
- ✅ Docker一键部署

## 开发团队

- 产品设计：用户需求导向
- 前端开发：Vue3 + Element Plus
- 后端开发：Node.js + Express
- 数据库：MySQL 8.0

## 支持

如有问题或建议，欢迎提交 Issue 或 Pull Request。

## License

MIT License - 详见 [LICENSE](LICENSE) 文件
