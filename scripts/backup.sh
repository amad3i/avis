#!/usr/bin/env bash
# Бэкап базы SQLite + загруженных фото. Поставить в cron:
#   0 3 * * * /var/www/shawarma/scripts/backup.sh /var/www/shawarma /var/backups/shawarma
set -e

APP_DIR=${1:-.}
BACKUP_DIR=${2:-./backups}
STAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

if [ -f "$APP_DIR/prisma/dev.db" ]; then
  sqlite3 "$APP_DIR/prisma/dev.db" ".backup '$BACKUP_DIR/db-$STAMP.db'" 2>/dev/null \
    || cp "$APP_DIR/prisma/dev.db" "$BACKUP_DIR/db-$STAMP.db"
  echo "OK: db-$STAMP.db"
fi

if [ -d "$APP_DIR/public/uploads" ]; then
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$APP_DIR/public" uploads
  echo "OK: uploads-$STAMP.tar.gz"
fi

# хранить 30 дней
find "$BACKUP_DIR" -name "db-*.db" -mtime +30 -delete
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime +30 -delete
echo "Бэкап завершён: $BACKUP_DIR"
