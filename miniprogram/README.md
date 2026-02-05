# 养老积分超市 - 微信小程序

## 项目结构

```
miniprogram/
├── app.js              # 小程序入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── pages/
│   ├── login/          # 登录页
│   ├── admin/          # 管理员页面
│   │   ├── dashboard/  # 首页
│   │   ├── institutions/ # 院点管理
│   │   ├── users/      # 院长账号管理
│   │   ├── products/   # 商品管理
│   │   ├── rules/      # 积分规则管理
│   │   └── records/    # 流水查询
│   └── director/       # 院长页面
│       ├── dashboard/  # 首页
│       ├── grant/      # 积分发放
│       ├── exchange/   # 积分兑换
│       ├── helpers/    # 护工管理
│       ├── elderly/    # 老人管理
│       └── records/    # 流水查询
└── utils/              # 工具函数
```

## 功能模块

### 管理员功能
1. **院点管理** - 添加/编辑/删除院点，设置院长账号
2. **院长账号** - 管理各院院长登录账号
3. **商品管理** - 添加兑换商品，设置积分价格
4. **积分规则** - 设置各类服务的每小时积分标准
5. **流水查询** - 查看所有积分发放和兑换记录

### 院长功能
1. **积分发放** - 为护工/老人发放服务积分
2. **积分兑换** - 用积分兑换商品
3. **护工管理** - 查看本院护工信息和积分
4. **老人管理** - 查看本院老人信息和积分
5. **流水查询** - 查看本院积分记录

## 开发步骤

### 1. 配置后端API
在 `app.js` 中修改 `baseUrl` 为你的服务器地址：
```javascript
globalData: {
  baseUrl: 'https://your-server.com'  // 生产环境
}
```

### 2. 完善页面逻辑
每个页面需要创建对应的 `.js` 和 `.wxss` 文件。

### 3. 后端接口适配
后端需要保持之前开发的 RESTful API 接口。

## 后端接口列表

### 认证
- `POST /api/auth/login` - 登录

### 管理员
- `GET /api/institutions` - 获取院点列表
- `POST /api/institutions` - 创建院点
- `PUT /api/institutions/:id` - 更新院点
- `DELETE /api/institutions/:id` - 删除院点

- `GET /api/users` - 获取院长列表
- `POST /api/users` - 创建院长
- `PUT /api/users/:id` - 更新院长
- `DELETE /api/users/:id` - 删除院长

- `GET /api/products` - 获取商品列表
- `POST /api/products` - 创建商品
- `PUT /api/products/:id` - 更新商品
- `DELETE /api/products/:id` - 删除商品

- `GET /api/service-rules` - 获取积分规则
- `POST /api/service-rules` - 创建规则
- `PUT /api/service-rules/:id` - 更新规则

### 院长
- `GET /api/helpers` - 获取护工列表
- `GET /api/elderly` - 获取老人列表
- `GET /api/persons` - 获取人员列表（级联选择）
- `POST /api/grant` - 发放积分
- `POST /api/exchange` - 积分兑换
- `GET /api/records` - 查询流水

## 使用微信开发者工具

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目，选择 `miniprogram` 目录
3. 修改 `appid`（使用测试号或申请正式号）
4. 开始开发和调试

## 部署

小程序需要配合后端服务器使用，后端可以继续使用之前的 Node.js + MySQL 架构，部署在国内服务器上。
