#!/usr/bin/env bash
# Развёртывание «Привал» на сервере под домен prival.pro: создаёт/обновляет .env и поднимает docker compose.
# Запуск: ./scripts/deploy.sh
# HTTPS этот скрипт не настраивает — для этого после первого запуска (и когда DNS
# prival.pro будет указывать на этот сервер) выполните ./scripts/init-letsencrypt.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env"

if ! command -v docker >/dev/null 2>&1; then
  echo "Не найден docker. Установите Docker (и docker compose) и запустите скрипт ещё раз." >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Не найден 'docker compose'. Обновите Docker Desktop / docker-ce до версии с поддержкой compose v2." >&2
  exit 1
fi

echo "=================================="
echo " Привал — развёртывание на prival.pro"
echo "=================================="

# Спрашивает значение с описанием. Если задан $3 (значение по умолчанию) — можно просто нажать Enter.
ask() {
  local var_name="$1" description="$2" default="${3:-}"
  local value=""
  echo ""
  echo "$description"
  if [ -n "$default" ]; then
    read -r -p "${var_name} [${default}]: " value
    value="${value:-$default}"
  else
    while [ -z "$value" ]; do
      read -r -p "${var_name}: " value
      [ -z "$value" ] && echo "Значение обязательно, попробуйте ещё раз."
    done
  fi
  printf -v "$var_name" '%s' "$value"
}

if [ -f "$ENV_FILE" ]; then
  echo ""
  echo "Файл .env уже существует."
  read -r -p "Пересоздать его заново с новыми вопросами? (y/N): " RECREATE
  if [[ "${RECREATE:-}" != "y" && "${RECREATE:-}" != "Y" ]]; then
    echo ""
    echo "Оставляю текущий .env. Пересобираю образы и перезапускаю контейнеры…"
    docker compose up -d --build
    echo ""
    echo "Готово. Текущие настройки — в файле .env."
    exit 0
  fi
  cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%s)"
  echo "Старый .env сохранён рядом как резервная копия."
fi

echo ""
echo "Порты на хосте. Для обычной работы под доменом prival.pro (https://prival.pro без порта в адресе)"
echo "оставьте порт фронтенда 80 — жмите Enter. Меняйте только если порт занят другим сервисом на сервере."
ask FRONTEND_PORT "Порт фронтенда (HTTP)" "80"
ask FRONTEND_SSL_PORT "Порт фронтенда (HTTPS)" "443"

echo ""
echo "Порт бэкенда (API). Наружу не обязателен — nginx проксирует /api внутри docker-сети,"
echo "открыт только для удобства прямого захода в /docs при отладке."
ask BACKEND_PORT "Порт бэкенда" "8000"

echo ""
echo "Порт PostgreSQL. Наружу его открывать не обязательно, но при желании можно сменить (например, если 5432 занят другим сервисом на сервере)."
ask DB_PORT "Порт PostgreSQL" "5432"

echo ""
echo "Логин и пароль для базы данных PostgreSQL. Используются только внутри docker compose, между контейнерами —"
echo "наружу не торчат. Можно оставить предложенные значения (пароль сгенерирован случайно)."
ask DB_USER "Имя пользователя БД" "privalcafe"
ask DB_PASSWORD "Пароль БД" "$(openssl rand -hex 16)"
ask DB_NAME "Имя базы данных" "privalcafe"

echo ""
echo "Код доступа в админ-панель (/admin) — его вводит сотрудник кафе при входе в раздел «Заказы», «Меню» и т.д."
echo "Придумайте свой, не оставляйте пустым и не используйте значение из тестового окружения."
ask ADMIN_PASSCODE "Код доступа в админку"

echo ""
echo "Почта для Let's Encrypt — на неё пришлют уведомление, если сертификат prival.pro не продлится сам."
echo "Понадобится позже, для scripts/init-letsencrypt.sh — можно указать любую рабочую почту."
ask CERTBOT_EMAIL "Email для Let's Encrypt"

echo ""
echo "Генерирую служебные секреты автоматически (вводить их не нужно):"
echo " - JWT_SECRET — подписывает сессию входа в админку;"
echo " - ENCRYPTION_KEY — шифрует пароль приложения почты перед сохранением в БД (задаётся в /admin/settings)."
JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
ENCRYPTION_KEY="$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_')"

cat > "$ENV_FILE" <<EOF
# Сгенерировано scripts/deploy.sh $(date '+%Y-%m-%d %H:%M:%S')
# Не публикуйте этот файл — в нём пароли и секретные ключи.

FRONTEND_PORT=${FRONTEND_PORT}
FRONTEND_SSL_PORT=${FRONTEND_SSL_PORT}
BACKEND_PORT=${BACKEND_PORT}
DB_PORT=${DB_PORT}

DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# Пусто — фронтенд ходит в API по относительному пути, nginx проксирует на backend сам.
VITE_API_URL=

ADMIN_PASSCODE=${ADMIN_PASSCODE}

JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
CORS_ORIGINS=https://prival.pro,https://www.prival.pro,http://prival.pro,http://www.prival.pro

CERTBOT_EMAIL=${CERTBOT_EMAIL}
EOF

echo ""
echo ".env создан. Собираю образы и запускаю контейнеры (docker compose up -d --build)…"
echo ""
docker compose up -d --build

echo ""
echo "=================================="
echo " Готово (пока по HTTP)"
echo "=================================="
echo "Сайт для гостей:  http://prival.pro"
echo "Админ-панель:     http://prival.pro/admin"
echo "API / документация: http://prival.pro:${BACKEND_PORT}/docs"
echo ""
echo "Проверьте, что DNS prival.pro и www.prival.pro уже указывает на этот сервер, затем включите HTTPS:"
echo "  ./scripts/init-letsencrypt.sh"
echo ""
echo "После входа в админку (код: тот, что вы задали выше) откройте «Настройки» и укажите"
echo "почту-отправитель, пароль приложения и адрес для уведомлений о заказах."
echo ""
echo "Файл .env содержит пароли и секреты — храните его в безопасности и не публикуйте."
