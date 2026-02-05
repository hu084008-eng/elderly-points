# 腾讯云部署指南

## 一、购买腾讯云服务器

### 1. 注册/登录腾讯云
访问：https://cloud.tencent.com

### 2. 购买轻量应用服务器
访问：https://console.cloud.tencent.com/lighthouse/instance/create

**配置选择：**
- **地域**：选择离你近的（如上海/广州）
- **镜像**：Ubuntu 20.04 LTS
- **套餐**：新用户首单特惠 2核2G4M（约120元/年）
- **购买时长**：1年

### 3. 购买云数据库 MySQL
访问：https://console.cloud.tencent.com/cdb

**配置选择：**
- **数据库版本**：MySQL 8.0
- **实例规格**：基础版 1核1G（约150元/年）
- **创建数据库**：elderly_care
- **设置密码**：设置强密码

---

## 二、配置服务器

### 1. 重置密码并登录
在轻量服务器控制台：
- 点击 **"重置密码"** - 设置 root 密码
- 点击 **"登录"** 或使用 SSH 客户端连接

### 2. 登录服务器
```bash
ssh root@你的服务器IP
```

### 3. 运行部署脚本
```bash
# 下载部署脚本
cd /opt
git clone https://github.com/hu084008-eng/elderly-points.git
cd elderly-points

# 编辑配置（填入你的数据库信息）
vi deploy-tencent.sh

# 运行部署
chmod +x deploy-tencent.sh
./deploy-tencent.sh
```

---

## 三、配置数据库

### 1. 在腾讯云控制台开启外网访问
云数据库 MySQL → 管理 → 开启外网地址

### 2. 初始化数据库
脚本会自动创建表和初始数据

---

## 四、配置微信小程序

### 1. 修改小程序后端地址
编辑 `miniprogram/app.js`：
```javascript
globalData: {
  baseUrl: 'http://你的腾讯云服务器IP:3000'
}
```

### 2. 配置服务器域名白名单
登录微信公众平台 → 开发管理 → 开发设置 → 服务器域名

添加：
- request合法域名：`http://你的服务器IP:3000`
- uploadFile合法域名：`http://你的服务器IP:3000`

---

## 五、完成！

现在小程序应该可以正常登录和使用了！

**测试账号：**
- 管理员：admin / admin123
- 李河院长：lihe_yz / 123456
- 武陵院长：wuling_yz / 123456
- 甘宁院长：ganning_yz / 123456
