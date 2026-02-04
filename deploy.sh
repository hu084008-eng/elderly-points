#!/bin/bash

# 农村互助养老积分超市管理系统 - 部署脚本

echo "========================================"
echo "  农村互助养老积分超市管理系统部署工具"
echo "========================================"

# 检查Docker和Docker Compose
if ! command -v docker &> /dev/null; then
    echo "错误：Docker未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误：Docker Compose未安装"
    exit 1
fi

# 显示菜单
show_menu() {
    echo ""
    echo "请选择操作："
    echo "1. 首次部署（构建并启动）"
    echo "2. 启动服务"
    echo "3. 停止服务"
    echo "4. 重启服务"
    echo "5. 查看日志"
    echo "6. 备份数据库"
    echo "7. 恢复数据库"
    echo "8. 查看状态"
    echo "0. 退出"
    echo ""
}

# 首次部署
deploy() {
    echo "正在构建并部署服务..."
    docker-compose down -v
    docker-compose up -d --build
    echo "等待数据库初始化..."
    sleep 10
    echo "部署完成！"
    echo "访问地址：http://localhost"
    echo "管理员账号：admin / 123456"
}

# 启动服务
start() {
    echo "正在启动服务..."
    docker-compose up -d
    echo "服务已启动"
}

# 停止服务
stop() {
    echo "正在停止服务..."
    docker-compose down
    echo "服务已停止"
}

# 重启服务
restart() {
    echo "正在重启服务..."
    docker-compose restart
    echo "服务已重启"
}

# 查看日志
logs() {
    docker-compose logs -f
}

# 备份数据库
backup() {
    BACKUP_DIR="./backups"
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "正在备份数据库..."
    docker-compose exec -T mysql mysqldump -uroot -proot123456 elderly_care > "$BACKUP_FILE"
    echo "备份完成：$BACKUP_FILE"
}

# 恢复数据库
restore() {
    echo "请输入备份文件路径："
    read BACKUP_FILE
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "错误：文件不存在"
        return
    fi
    echo "正在恢复数据库..."
    docker-compose exec -T mysql mysql -uroot -proot123456 elderly_care < "$BACKUP_FILE"
    echo "恢复完成"
}

# 查看状态
status() {
    docker-compose ps
}

# 主循环
while true; do
    show_menu
    read -p "请输入选项 [0-8]: " choice
    case $choice in
        1) deploy ;;
        2) start ;;
        3) stop ;;
        4) restart ;;
        5) logs ;;
        6) backup ;;
        7) restore ;;
        8) status ;;
        0) echo "再见！"; exit 0 ;;
        *) echo "无效选项" ;;
    esac
done
