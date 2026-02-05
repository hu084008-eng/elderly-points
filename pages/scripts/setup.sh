#!/bin/bash

echo "========================================"
echo "  农村互助养老积分超市管理系统 - 初始化"
echo "========================================"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "错误：Docker未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误：Docker Compose未安装"
    exit 1
fi

# 创建必要目录
mkdir -p backend/uploads
mkdir -p backups
mkdir -p logs

# 设置权限
chmod +x deploy.sh
chmod +x scripts/*.sh

# 复制环境变量文件
if [ ! -f .env ]; then
    cp .env.example .env
    echo "已创建 .env 文件，请修改配置"
fi

echo "初始化完成！"
echo ""
echo "接下来请执行："
echo "  1. 修改 .env 文件中的配置"
echo "  2. 运行: docker-compose up -d --build"
