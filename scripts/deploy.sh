#!/usr/bin/env bash
# Развёртывание «Привал» на сервере под домен prival.online: создаёт/обновляет .env и поднимает docker compose.
# Запуск: ./scripts/deploy.sh
# В конце предлагает сразу включить HTTPS (Let's Encrypt или Cloudflare).

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
echo " Привал — развёртывание на prival.online"
echo "=================================="

# Рабочий конфиг nginx не хранится в git. Если его нет — стартуем с HTTP-версии
# (она нужна и для выпуска сертификата Let's Encrypt); SSL-скрипты потом заменят его.
# Без этого файла docker смонтировал бы вместо него пустую папку и nginx не запустился бы.
NGINX_ACTIVE="frontend/nginx/active.conf"
if [ ! -f "$NGINX_ACTIVE" ]; then
  cp frontend/nginx/http.conf "$NGINX_ACTIVE"
fi

# Предлагает включить HTTPS сразу после запуска стека.
setup_https() {
  if grep -q "listen 443" "$NGINX_ACTIVE"; then
    echo ""
    echo "HTTPS уже включён (frontend/nginx/active.conf). Сайт: https://prival.online"
    return
  fi
  echo ""
  echo "Включить HTTPS для prival.online сейчас?"
  echo "  1) Let's Encrypt — DNS prival.online и www.prival.online указывают прямо на этот сервер, порт 80 открыт"
  echo "  2) Cloudflare — домен подключён к Cloudflare (оранжевое облако), нужен CF_API_TOKEN"
  echo "  3) Свой (купленный) сертификат — файлы .crt/.key уже лежат на сервере"
  echo "  4) Позже"
  local choice=""
  read -r -p "Выбор [1]: " choice
  case "${choice:-1}" in
    1) ./scripts/init-letsencrypt.sh || echo "Не удалось выпустить сертификат — сайт пока работает по HTTP, исправьте причину и запустите ./scripts/init-letsencrypt.sh" ;;
    2) ./scripts/cloudflare-ssl.sh || echo "Не удалось получить сертификат Cloudflare — сайт пока работает по HTTP, исправьте причину и запустите ./scripts/cloudflare-ssl.sh" ;;
    3)
      local ssl_dir=""
      read -r -p "Папка с файлами сертификата (например ~/ssl): " ssl_dir
      ssl_dir="${ssl_dir/#\~/$HOME}"
      ./scripts/install-ssl.sh "$ssl_dir" || echo "Не удалось установить сертификат — сайт пока работает по HTTP, исправьте причину и запустите ./scripts/install-ssl.sh <папка>"
      ;;
    *)
      echo ""
      echo "HTTPS пока не включён, сайт работает по http://prival.online. Включить позже:"
      echo "  ./scripts/init-letsencrypt.sh   или   ./scripts/cloudflare-ssl.sh   или   ./scripts/install-ssl.sh <папка>"
      ;;
  esac
}

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

# Значения по умолчанию для повторного запуска: если .env уже существует, подхватываем из него
# DB_* и секреты — их менять самовольно нельзя (см. ниже, почему).
PREV_FRONTEND_PORT="80"
PREV_FRONTEND_SSL_PORT="443"
PREV_BACKEND_PORT="8000"
PREV_DB_PORT="5432"
PREV_DB_USER="privalcafe"
PREV_DB_PASSWORD=""
PREV_DB_NAME="privalcafe"
PREV_ADMIN_PASSCODE=""
PREV_CERTBOT_EMAIL=""
PREV_JWT_SECRET=""
PREV_ENCRYPTION_KEY=""

if [ -f "$ENV_FILE" ]; then
  echo ""
  echo "Файл .env уже существует."
  read -r -p "Пересоздать его заново с новыми вопросами? (y/N): " RECREATE
  if [[ "${RECREATE:-}" != "y" && "${RECREATE:-}" != "Y" ]]; then
    echo ""
    echo "Оставляю текущий .env. Пересобираю образы и перезапускаю контейнеры…"
    docker compose up -d --build
    setup_https
    echo ""
    echo "Готово. Текущие настройки — в файле .env."
    exit 0
  fi

  # Подхватываем прежние значения ДО перезаписи файла.
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  PREV_FRONTEND_PORT="${FRONTEND_PORT:-80}"
  PREV_FRONTEND_SSL_PORT="${FRONTEND_SSL_PORT:-443}"
  PREV_BACKEND_PORT="${BACKEND_PORT:-8000}"
  PREV_DB_PORT="${DB_PORT:-5432}"
  PREV_DB_USER="${DB_USER:-privalcafe}"
  PREV_DB_PASSWORD="${DB_PASSWORD:-}"
  PREV_DB_NAME="${DB_NAME:-privalcafe}"
  PREV_ADMIN_PASSCODE="${ADMIN_PASSCODE:-}"
  PREV_CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
  PREV_JWT_SECRET="${JWT_SECRET:-}"
  PREV_ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"

  cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%s)"
  echo "Старый .env сохранён рядом как резервная копия."
fi

echo ""
echo "Порты на хосте. Для обычной работы под доменом prival.online (https://prival.online без порта в адресе)"
echo "оставьте порт фронтенда 80 — жмите Enter. Меняйте только если порт занят другим сервисом на сервере."
ask FRONTEND_PORT "Порт фронтенда (HTTP)" "$PREV_FRONTEND_PORT"
ask FRONTEND_SSL_PORT "Порт фронтенда (HTTPS)" "$PREV_FRONTEND_SSL_PORT"

echo ""
echo "Порт бэкенда (API). Наружу не обязателен — nginx проксирует /api внутри docker-сети,"
echo "открыт только для удобства прямого захода в /docs при отладке."
ask BACKEND_PORT "Порт бэкенда" "$PREV_BACKEND_PORT"

echo ""
echo "Порт PostgreSQL. Наружу его открывать не обязательно, но при желании можно сменить (например, если 5432 занят другим сервисом на сервере)."
ask DB_PORT "Порт PostgreSQL" "$PREV_DB_PORT"

echo ""
echo "Логин и пароль для базы данных PostgreSQL. Используются только внутри docker compose, между контейнерами —"
echo "наружу не торчат."
if [ -n "$PREV_DB_PASSWORD" ]; then
  echo "У вас уже есть развёрнутая база — оставляю прежние логин/пароль (жмите Enter). ВАЖНО: Postgres задаёт"
  echo "пароль только при первом запуске на пустых данных — если впишете сюда новый, база откажет в подключении,"
  echo "пока вручную не смените пароль ещё и в самой Postgres (ALTER USER ...) или не пересоздадите volume."
else
  echo "Можно оставить предложенные значения (пароль сгенерирован случайно)."
fi
ask DB_USER "Имя пользователя БД" "$PREV_DB_USER"
ask DB_PASSWORD "Пароль БД" "${PREV_DB_PASSWORD:-$(openssl rand -hex 16)}"
ask DB_NAME "Имя базы данных" "$PREV_DB_NAME"

echo ""
echo "Код доступа в админ-панель (/admin) — его вводит сотрудник кафе при входе в раздел «Заказы», «Меню» и т.д."
if [ -n "$PREV_ADMIN_PASSCODE" ]; then
  ask ADMIN_PASSCODE "Код доступа в админку" "$PREV_ADMIN_PASSCODE"
else
  echo "Придумайте свой, не оставляйте пустым и не используйте значение из тестового окружения."
  ask ADMIN_PASSCODE "Код доступа в админку"
fi

echo ""
echo "Email для Let's Encrypt — на него придёт уведомление, если сертификат не продлится сам."
echo "Нужен только для HTTPS через Let's Encrypt; если будете использовать Cloudflare — жмите Enter."
read -r -p "Email для Let's Encrypt [${PREV_CERTBOT_EMAIL}]: " CERTBOT_EMAIL
CERTBOT_EMAIL="${CERTBOT_EMAIL:-$PREV_CERTBOT_EMAIL}"

echo ""
if [ -n "$PREV_JWT_SECRET" ] && [ -n "$PREV_ENCRYPTION_KEY" ]; then
  echo "Сохраняю прежние JWT_SECRET и ENCRYPTION_KEY — их смена сбросит все сессии входа в админку"
  echo "и сделает нечитаемым уже сохранённый в БД пароль приложения почты (/admin/settings)."
  JWT_SECRET="$PREV_JWT_SECRET"
  ENCRYPTION_KEY="$PREV_ENCRYPTION_KEY"
else
  echo "Генерирую служебные секреты автоматически (вводить их не нужно):"
  echo " - JWT_SECRET — подписывает сессию входа в админку;"
  echo " - ENCRYPTION_KEY — шифрует пароль приложения почты перед сохранением в БД (задаётся в /admin/settings)."
  JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  ENCRYPTION_KEY="$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_')"
fi

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
CORS_ORIGINS=https://prival.online,https://www.prival.online

CERTBOT_EMAIL=${CERTBOT_EMAIL}
EOF

echo ""
echo ".env создан. Собираю образы и запускаю контейнеры (docker compose up -d --build)…"
echo ""
docker compose up -d --build

echo ""
echo "Контейнеры запущены."
setup_https

echo ""
echo "=================================="
echo " Готово"
echo "=================================="
if grep -q "listen 443" "$NGINX_ACTIVE"; then
  echo "Сайт для гостей:  https://prival.online"
  echo "Админ-панель:     https://prival.online/admin"
else
  echo "Сайт для гостей:  http://prival.online"
  echo "Админ-панель:     http://prival.online/admin"
fi
echo ""
echo "После входа в админку (код: тот, что вы задали выше) откройте «Настройки» и укажите"
echo "почту-отправитель, пароль приложения и адрес для уведомлений о заказах."
echo ""
echo "Файл .env содержит пароли и секреты — храните его в безопасности и не публикуйте."
