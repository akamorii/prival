#!/usr/bin/env bash
# Развёртывание «Привал» на сервере: создаёт/обновляет .env и поднимает docker compose.
# Запуск: ./scripts/deploy.sh

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
echo " Привал — развёртывание на сервере"
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
echo "Домен или публичный IP сервера, по которому сайт будет открываться в браузере гостей и админа."
echo "Например: cafe-privl.ru — если есть домен, или 203.0.113.10 — если только IP. Без 'http://' и без порта."
ask PUBLIC_HOST "Адрес сервера"

echo ""
echo "Протокол. Если для сайта уже настроен SSL-сертификат (сайт открывается по https) — введите https,"
echo "если сертификата пока нет — http (можно будет переключиться позже, перезапустив этот скрипт)."
ask SCHEME "Протокол (http/https)" "http"

echo ""
echo "Порт, на котором сайт для гостей будет слушать на сервере (снаружи, через этот порт заходят гости и админ)."
ask FRONTEND_PORT "Порт фронтенда" "8080"

echo ""
echo "Порт бэкенда (API). Обычно можно оставить как есть — он не показывается гостям напрямую."
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
echo "Генерирую служебные секреты автоматически (вводить их не нужно):"
echo " - JWT_SECRET — подписывает сессию входа в админку;"
echo " - ENCRYPTION_KEY — шифрует пароль приложения почты перед сохранением в БД (задаётся в /admin/settings)."
JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
ENCRYPTION_KEY="$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_')"

cat > "$ENV_FILE" <<EOF
# Сгенерировано scripts/deploy.sh $(date '+%Y-%m-%d %H:%M:%S')
# Не публикуйте этот файл — в нём пароли и секретные ключи.

FRONTEND_PORT=${FRONTEND_PORT}
BACKEND_PORT=${BACKEND_PORT}
DB_PORT=${DB_PORT}

DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# Адрес бэкенда — вшивается в собранный фронтенд на этапе сборки,
# браузер гостя должен уметь до него достучаться напрямую.
VITE_API_URL=${SCHEME}://${PUBLIC_HOST}:${BACKEND_PORT}
VITE_ADMIN_PASSCODE=${ADMIN_PASSCODE}

JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
CORS_ORIGINS=${SCHEME}://${PUBLIC_HOST}:${FRONTEND_PORT}
EOF

echo ""
echo ".env создан. Собираю образы и запускаю контейнеры (docker compose up -d --build)…"
echo ""
docker compose up -d --build

echo ""
echo "=================================="
echo " Готово"
echo "=================================="
echo "Сайт для гостей:  ${SCHEME}://${PUBLIC_HOST}:${FRONTEND_PORT}"
echo "Админ-панель:     ${SCHEME}://${PUBLIC_HOST}:${FRONTEND_PORT}/admin"
echo "API / документация: ${SCHEME}://${PUBLIC_HOST}:${BACKEND_PORT}/docs"
echo ""
echo "После входа в админку (код: тот, что вы задали выше) откройте «Настройки» и укажите"
echo "почту-отправитель, пароль приложения и адрес для уведомлений о заказах."
echo ""
echo "Файл .env содержит пароли и секреты — храните его в безопасности и не публикуйте."
