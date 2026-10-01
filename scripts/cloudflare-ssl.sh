#!/usr/bin/env bash
# Настройка HTTPS для prival.pro через Cloudflare — альтернатива Let's Encrypt
# (scripts/init-letsencrypt.sh), без возни с DNS-проверкой и открытым портом 80 наружу.
#
# Как это работает: Cloudflare становится прокси перед сайтом и сам выдаёт публичный
# сертификат, который видят гости. Этот скрипт получает отдельный сертификат
# Cloudflare Origin CA — он нужен только для шифрования трафика между Cloudflare и
# этим сервером (режим SSL/TLS = Full (strict) в Cloudflare).
#
# Что нужно заранее:
#   1) Домен prival.pro подключён к Cloudflare (его DNS управляется через Cloudflare —
#      в дашборде Cloudflare будет написано, на какие NS-серверы переключить домен
#      у регистратора).
#   2) API-токен Cloudflare с правом "Zone / SSL and Certificates / Edit" для зоны
#      prival.pro: dash.cloudflare.com → My Profile → API Tokens → Create Token →
#      Custom token → добавить это право → ограничить зоной prival.pro.
#
# Использование:
#   CF_API_TOKEN=xxxxx ./scripts/cloudflare-ssl.sh
#   (или просто ./scripts/cloudflare-ssl.sh — токен спросит в диалоге)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DOMAIN="prival.pro"
WWW_DOMAIN="www.prival.pro"
CERTS_DIR="frontend/nginx/certs"

for bin in openssl curl jq; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Не найдена утилита '$bin'. Установите её (например: sudo apt install -y $bin) и запустите скрипт снова." >&2
    exit 1
  fi
done

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${CF_API_TOKEN:-}" ] && [ -z "${CF_ORIGIN_CA_KEY:-}" ]; then
  echo "Нужен API-токен Cloudflare с правом 'Zone / SSL and Certificates / Edit' для зоны ${DOMAIN}."
  echo "Создать: dash.cloudflare.com → My Profile → API Tokens → Create Token → Custom token."
  read -r -s -p "CF_API_TOKEN: " CF_API_TOKEN
  echo ""
fi

if [ -n "${CF_API_TOKEN:-}" ]; then
  AUTH_HEADER=(-H "Authorization: Bearer ${CF_API_TOKEN}")
else
  AUTH_HEADER=(-H "X-Auth-User-Service-Key: ${CF_ORIGIN_CA_KEY}")
fi

mkdir -p "$CERTS_DIR"
KEY_FILE="$CERTS_DIR/${DOMAIN}.key"
CERT_FILE="$CERTS_DIR/${DOMAIN}.pem"
CSR_FILE="$(mktemp)"
trap 'rm -f "$CSR_FILE"' EXIT

echo ""
echo "Генерирую приватный ключ и запрос на сертификат (CSR) для ${DOMAIN} и ${WWW_DOMAIN}…"
openssl req -new -newkey rsa:2048 -nodes \
  -keyout "$KEY_FILE" \
  -subj "/CN=${DOMAIN}" \
  -addext "subjectAltName=DNS:${DOMAIN},DNS:${WWW_DOMAIN}" \
  -out "$CSR_FILE"
chmod 600 "$KEY_FILE"

echo ""
echo "Запрашиваю сертификат у Cloudflare Origin CA (срок — 15 лет, продлевать не нужно)…"
PAYLOAD=$(jq -n --rawfile csr "$CSR_FILE" --arg h1 "$DOMAIN" --arg h2 "$WWW_DOMAIN" \
  '{hostnames: [$h1, $h2], requested_validity: 5475, request_type: "origin-rsa", csr: $csr}')

RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/certificates" \
  "${AUTH_HEADER[@]}" \
  -H "Content-Type: application/json" \
  --data "$PAYLOAD")

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" != "true" ]; then
  echo ""
  echo "Cloudflare отказал в выпуске сертификата:" >&2
  echo "$RESPONSE" | jq -r '.errors[]? | "  - \(.message)"' >&2
  exit 1
fi

echo "$RESPONSE" | jq -r '.result.certificate' > "$CERT_FILE"
echo ""
echo "Сертификат получен и сохранён в ${CERT_FILE}"

echo ""
echo "Переключаю nginx на Cloudflare-конфигурацию…"
cp frontend/nginx/https-cloudflare.conf frontend/nginx/active.conf

if docker compose ps frontend 2>/dev/null | grep -q "Up"; then
  docker compose exec frontend nginx -s reload
  echo "nginx перезагружен."
else
  echo "Контейнер frontend сейчас не запущен — конфигурация подхватится при следующем 'docker compose up -d'."
fi

echo ""
echo "=================================="
echo " Готово — осталось 2 шага в дашборде Cloudflare"
echo "=================================="
echo "1) DNS → записи ${DOMAIN} и ${WWW_DOMAIN} должны быть проксированы через Cloudflare"
echo "   (оранжевое облако \"Proxied\", не серое \"DNS only\")."
echo "2) SSL/TLS → Overview → режим шифрования: 'Full (strict)'."
echo ""
echo "После этого сайт будет открываться по https://${DOMAIN} с сертификатом от Cloudflare,"
echo "видимым гостям, а это соединение Cloudflare → сервер будет шифроваться выпущенным сейчас сертификатом."
