#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
mkdir -p $BACKUP_DIR
docker-compose exec -T mysql mysqldump -uroot -proot123456 elderly_care > $BACKUP_FILE
gzip $BACKUP_FILE
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
echo "备份完成: $BACKUP_FILE.gz"
