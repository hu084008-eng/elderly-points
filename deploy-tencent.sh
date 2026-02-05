#!/bin/bash

# 腾讯云一键部署脚本
# 适用于：腾讯云轻量应用服务器 Ubuntu 20.04

# ==================== 配置区域 ====================
# 数据库配置（修改为你的腾讯云数据库信息）
DB_HOST="你的云数据库外网地址.mysql.tencentcdb.com"
DB_PORT="3306"
DB_NAME="elderly_care"
DB_USER="root"
DB_PASSWORD="你的数据库密码"

# JWT 密钥（随机生成）
JWT_SECRET=$(openssl rand -base64 32)

# 项目路径
PROJECT_DIR="/opt/elderly-points"
# =================================================

echo "================================"
echo "养老积分超市 - 腾讯云部署脚本"
echo "================================"

# 1. 更新系统
echo "[1/10] 更新系统..."
apt update && apt upgrade -y

# 2. 安装 Node.js
echo "[2/10] 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
node -v
npm -v

# 3. 安装 MySQL 客户端
echo "[3/10] 安装 MySQL 客户端..."
apt install -y mysql-client

# 4. 安装 Nginx
echo "[4/10] 安装 Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 5. 安装 Git
echo "[5/10] 安装 Git..."
apt install -y git

# 6. 安装 PM2
echo "[6/10] 安装 PM2..."
npm install -g pm2

# 7. 克隆代码
echo "[7/10] 克隆代码..."
cd /opt
git clone https://github.com/hu084008-eng/elderly-points.git

# 8. 部署后端
echo "[8/10] 部署后端..."
cd $PROJECT_DIR/backend

# 安装依赖
npm install --production

# 创建环境变量文件
cat > .env << EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=3000
EOF

echo "后端环境变量已创建"

# 9. 配置 Nginx
echo "[9/10] 配置 Nginx..."
cat > /etc/nginx/sites-available/elderly << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 允许大文件上传
    client_max_body_size 20M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/elderly /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

# 10. 启动后端服务
echo "[10/10] 启动后端服务..."
cd $PROJECT_DIR/backend

# 停止旧进程
pm2 delete elderly-backend 2>/dev/null || true

# 启动新进程
pm2 start src/app.js --name elderly-backend --restart-delay=3000
pm2 startup
pm2 save

# 配置防火墙
echo "配置防火墙..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

echo ""
echo "================================"
echo "部署完成！"
echo "================================"
echo ""
echo "访问地址: http://$(curl -s ifconfig.me)"
echo ""
echo "默认账号:"
echo "  管理员: admin / admin123"
echo "  李河院: lihe_yz / 123456"
echo "  武陵院: wuling_yz / 123456"
echo "  甘宁院: ganning_yz / 123456"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs elderly-backend"
echo "  重启服务: pm2 restart elderly-backend"
echo "  查看状态: pm2 status"
echo "================================"
