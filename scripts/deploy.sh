#!/usr/bin/env bash
# Деплой white-label решения на VPS (Ubuntu + nginx).
# Использование: ./scripts/deploy.sh user@server /var/www/shawarma
set -e

REMOTE=${1:?"Укажите user@server"}
DIR=${2:-/var/www/shawarma}

echo ">>> Сборка локально не требуется — собираем на сервере"
ssh "$REMOTE" "cd $DIR && git pull && npm ci && npx prisma db push && npm run build"

echo ">>> Перезапуск через pm2"
ssh "$REMOTE" "cd $DIR && pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js"

echo ">>> Готово. Health-check:"
ssh "$REMOTE" "sleep 3 && curl -s http://localhost:3000/api/health"
