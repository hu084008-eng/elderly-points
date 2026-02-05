# 农村互助养老积分超市管理系统 - Makefile

.PHONY: help build start stop restart logs shell backup clean

help:
	@echo "农村互助养老积分超市管理系统"
	@echo ""
	@echo "可用命令:"
	@echo "  make build    - 构建Docker镜像"
	@echo "  make start    - 启动服务"
	@echo "  make stop     - 停止服务"
	@echo "  make restart  - 重启服务"
	@echo "  make logs     - 查看日志"
	@echo "  make shell    - 进入后端容器"
	@echo "  make backup   - 备份数据库"
	@echo "  make clean    - 清理所有数据"

build:
	docker-compose build

start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

shell:
	docker-compose exec backend sh

backup:
	@mkdir -p backups
	@docker-compose exec -T mysql mysqldump -uroot -proot123456 elderly_care > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "备份完成"

clean:
	docker-compose down -v
	rm -rf mysql_data
	rm -rf backend/uploads/*
	@echo "清理完成"
