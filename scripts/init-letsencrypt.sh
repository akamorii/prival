#!/usr/bin/env bash
# Разовая настройка HTTPS для prival.pro через Let's Encrypt.
#
# Запускать один раз на самом сервере, ПОСЛЕ того как:
#   1) DNS-записи prival.pro и www.prival.pro указывают на этот сервер;
#   2) на сервере уже поднят стек: docker compose up -d (сайт отвечает по http://prival.pro).
#
# Использование:
#   ./scripts/init-letsencrypt.sh            — настоящий сертификат
#   ./scripts/init-letsencrypt.sh --staging  — тестовый сертификат (для проверки, не расходует
#                                               недельный лимит Let's Encrypt на реальные сертификаты)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DOMAIN="prival.pro"
WWW_DOMAIN="www.prival.pro"
STAGING_FLAG=""

if [[ "${1:-}" == "--staging" ]]; then
  STAGING_FLAG="--staging"
  echo "Режим --staging: сертификат будет тестовым (браузер будет ругаться), зато не тратит лимит Let's Encrypt."
fi

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

CERTBOT_EMAIL="${CERTBOT_EMAIL:?Укажите CERTBOT_EMAIL в .env — на него придёт уведомление, если сертификат не продлится сам}"

echo "=================================="
echo " Let's Encrypt для ${DOMAIN}"
echo "=================================="

echo ""
echo "Проверяю, что стек запущен и сайт отвечает по HTTP…"
docker compose up -d frontend backend db

# Без -f: любой HTTP-ответ (даже 404 — файла challenge'а ещё нет, это нормально) значит,
# что домен резолвится сюда и порт 80 открыт. Ошибка curl'а здесь — это именно обрыв соединения.
if ! curl -s -o /dev/null "http://${DOMAIN}/.well-known/acme-challenge/" -m 10; then
  echo ""
  echo "ВНИМАНИЕ: http://${DOMAIN}/.well-known/acme-challenge/ не отвечает вообще (не 404, а обрыв соединения)."
  echo "Убедитесь, что DNS ${DOMAIN} и ${WWW_DOMAIN} уже указывает на этот сервер и порт 80 открыт наружу."
  read -r -p "Продолжить всё равно? (y/N): " CONTINUE
  [[ "${CONTINUE:-}" == "y" || "${CONTINUE:-}" == "Y" ]] || exit 1
fi

echo ""
echo "Запрашиваю сертификат для ${DOMAIN} и ${WWW_DOMAIN}…"
# --entrypoint certbot обязателен: у сервиса certbot в docker-compose.yml entrypoint
# переопределён под цикл автопродления, иначе наша команда certonly будет проигнорирована.
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
  --email "${CERTBOT_EMAIL}" --agree-tos --no-eff-email \
  ${STAGING_FLAG}

echo ""
echo "Сертификат получен. Переключаю nginx на HTTPS-конфигурацию…"
cp frontend/nginx/https.conf frontend/nginx/active.conf
docker compose exec frontend nginx -s reload

echo ""
echo "=================================="
echo " Готово"
echo "=================================="
echo "Сайт должен открываться по https://${DOMAIN}"
if [ -n "$STAGING_FLAG" ]; then
  echo ""
  echo "Это был тестовый (staging) сертификат — браузер покажет предупреждение о недоверенном сертификате."
  echo "Когда убедитесь, что всё работает, очистите тестовый сертификат и получите настоящий:"
  echo "  docker compose run --rm --entrypoint sh certbot -c 'rm -rf /etc/letsencrypt/live /etc/letsencrypt/archive /etc/letsencrypt/renewal'"
  echo "  ./scripts/init-letsencrypt.sh"
fi
echo ""
echo "Продление сертификата дальше происходит автоматически (сервис certbot проверяет раз в 12 часов)."
