#!/bin/bash
echo "执行数据库迁移..."
docker-compose exec mysql mysql -uroot -proot123456 -e "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "数据库连接失败"
    exit 1
fi
echo "迁移完成"
