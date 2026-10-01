#!/usr/bin/env bash
# Установка собственного (купленного) SSL-сертификата для prival.online — например, от
# регистратора домена. Альтернатива scripts/init-letsencrypt.sh и scripts/cloudflare-ssl.sh.
#
# Обычно продавец выдаёт 3–4 файла: сертификат домена, промежуточный сертификат,
# корневой сертификат и приватный ключ. Названия и расширения (.crt, .key, .pem, .txt)
# не важны — скрипт сам определяет по содержимому, что есть что:
#   - приватный ключ (нужен);
#   - сертификат домена (нужен);
#   - промежуточный сертификат (нужен — без него сайт не откроется на части телефонов);
#   - корневой сертификат (не нужен nginx'у, используется только для проверки цепочки).
#
# Использование — скопируйте все файлы в одну папку на сервере и передайте её:
#   ./scripts/install-ssl.sh ~/ssl
# или перечислите файлы явно:
#   ./scripts/install-ssl.sh certificate.crt intermediate.crt root.crt private.crt
#
# Купленный сертификат действует обычно год — после продления запустите скрипт ещё раз с новыми файлами.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DOMAIN="prival.online"
WWW_DOMAIN="www.prival.online"
CERTS_DIR="$ROOT_DIR/frontend/nginx/certs"
NGINX_ACTIVE="$ROOT_DIR/frontend/nginx/active.conf"

if [ $# -eq 0 ]; then
  echo "Укажите папку с файлами сертификата или сами файлы:" >&2
  echo "  ./scripts/install-ssl.sh ~/ssl" >&2
  echo "  ./scripts/install-ssl.sh certificate.crt intermediate.crt root.crt private.crt" >&2
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "Не найдена утилита 'openssl'. Установите её (например: sudo apt install -y openssl) и запустите скрипт снова." >&2
  exit 1
fi

# Пути разворачиваем до перехода в корень проекта — пользователь мог указать их относительно текущей папки.
FILES=()
for arg in "$@"; do
  if [ -d "$arg" ]; then
    for f in "$arg"/*; do
      [ -f "$f" ] && FILES+=("$(cd "$(dirname "$f")" && pwd)/$(basename "$f")")
    done
  elif [ -f "$arg" ]; then
    FILES+=("$(cd "$(dirname "$arg")" && pwd)/$(basename "$arg")")
  else
    echo "Не найден файл или папка: $arg" >&2
    exit 1
  fi
done

cd "$ROOT_DIR"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# --- Разбираем файлы: ключ отдельно, все сертификаты — по одному в c<N>.pem ---
CERT_COUNT=0
KEY_SRC=""
for f in "${FILES[@]}"; do
  # Файлы, сохранённые в Windows, бывают с переводами строк \r\n — openssl на них спотыкается.
  tr -d '\r' < "$f" > "$WORK/in"

  if grep -q -- '-----BEGIN .*PRIVATE KEY-----' "$WORK/in"; then
    if [ -n "$KEY_SRC" ]; then
      echo "Найдено два приватных ключа: $KEY_SRC и $f — оставьте только нужный." >&2
      exit 1
    fi
    KEY_SRC="$f"
    cp "$WORK/in" "$WORK/key.in"
  elif grep -q -- '-----BEGIN CERTIFICATE-----' "$WORK/in"; then
    # В одном файле может лежать сразу несколько сертификатов (цепочка, «bundle») — режем по одному.
    CERT_COUNT=$(awk -v dir="$WORK" -v n="$CERT_COUNT" '
      /-----BEGIN CERTIFICATE-----/ { n++; out = dir "/c" n ".pem" }
      out { print > out }
      /-----END CERTIFICATE-----/ { close(out); out = "" }
      END { print n }' "$WORK/in")
  elif openssl x509 -inform DER -in "$f" -out "$WORK/c$((CERT_COUNT + 1)).pem" 2>/dev/null; then
    # Двоичный формат (DER) — конвертируем в текстовый PEM, который понимает nginx.
    CERT_COUNT=$((CERT_COUNT + 1))
  else
    echo "Пропускаю $f — в нём нет ни сертификата, ни приватного ключа."
  fi
done

if [ -z "$KEY_SRC" ]; then
  echo "Среди файлов не найден приватный ключ (файл с текстом '-----BEGIN ... PRIVATE KEY-----')." >&2
  echo "Он выдаётся вместе с сертификатом или создавался при заказе (вместе с CSR)." >&2
  exit 1
fi

# --- Раскладываем сертификаты: домен / промежуточные / корневой ---
LEAF=""
ROOT=""
INTERMEDIATES=()
SEEN=" "
for ((i = 1; i <= CERT_COUNT; i++)); do
  c="$WORK/c$i.pem"
  fp=$(openssl x509 -in "$c" -noout -fingerprint -sha256 | cut -d= -f2)
  # Один и тот же сертификат часто лежит и отдельным файлом, и внутри bundle — дубли пропускаем.
  case "$SEEN" in *" $fp "*) continue ;; esac
  SEEN="$SEEN$fp "

  subject=$(openssl x509 -in "$c" -noout -subject -nameopt RFC2253)
  issuer=$(openssl x509 -in "$c" -noout -issuer -nameopt RFC2253)
  if [ "${subject#subject=}" = "${issuer#issuer=}" ]; then
    ROOT="$c"
  elif openssl x509 -in "$c" -noout -text | grep -q 'CA:TRUE'; then
    INTERMEDIATES+=("$c")
  else
    if [ -n "$LEAF" ]; then
      echo "Найдено несколько разных сертификатов домена — оставьте в папке только один комплект." >&2
      exit 1
    fi
    LEAF="$c"
  fi
done

if [ -z "$LEAF" ]; then
  echo "Среди файлов не найден сертификат домена (есть только корневые/промежуточные)." >&2
  exit 1
fi

# Выстраиваем промежуточные по порядку: домен → тот, кто его выпустил → … (так требует nginx).
CHAIN=()
current="$LEAF"
while :; do
  want=$(openssl x509 -in "$current" -noout -issuer -nameopt RFC2253)
  want="${want#issuer=}"
  next=""
  for c in "${INTERMEDIATES[@]+"${INTERMEDIATES[@]}"}"; do
    s=$(openssl x509 -in "$c" -noout -subject -nameopt RFC2253)
    if [ "${s#subject=}" = "$want" ]; then
      next="$c"
      break
    fi
  done
  [ -z "$next" ] && break
  # Защита от зацикливания на кривом наборе файлов.
  for done_c in "${CHAIN[@]+"${CHAIN[@]}"}"; do
    [ "$done_c" = "$next" ] && break 2
  done
  CHAIN+=("$next")
  current="$next"
done

echo ""
echo "Сертификат домена:"
openssl x509 -in "$LEAF" -noout -subject -issuer -enddate -nameopt RFC2253 | sed 's/^/  /'
echo "Промежуточных сертификатов в цепочке: ${#CHAIN[@]}"
[ -n "$ROOT" ] && echo "Корневой сертификат найден (nginx'у он не нужен, использую только для проверки)."

# --- Проверки ---
# Ключ может быть защищён паролем — тогда openssl спросит его здесь; nginx нужен ключ без пароля.
if ! openssl pkey -in "$WORK/key.in" -out "$WORK/key.pem" 2>"$WORK/key.err"; then
  echo "Не удалось прочитать приватный ключ $KEY_SRC:" >&2
  cat "$WORK/key.err" >&2
  exit 1
fi

key_pub=$(openssl pkey -in "$WORK/key.pem" -pubout | openssl sha256)
cert_pub=$(openssl x509 -in "$LEAF" -noout -pubkey | openssl sha256)
if [ "$key_pub" != "$cert_pub" ]; then
  echo "" >&2
  echo "Приватный ключ ($KEY_SRC) не подходит к сертификату домена." >&2
  echo "Нужен именно тот ключ, который создавался при заказе этого сертификата." >&2
  exit 1
fi
echo "Приватный ключ подходит к сертификату."

names=$(openssl x509 -in "$LEAF" -noout -text | grep -A1 'Subject Alternative Name' | tail -1)
if ! echo "$names" | grep -Fq "DNS:${DOMAIN}," && ! echo "$names" | grep -Eq "DNS:${DOMAIN}\$"; then
  echo "" >&2
  echo "Сертификат выпущен не для ${DOMAIN}. Домены в сертификате: ${names}" >&2
  exit 1
fi
if ! echo "$names" | grep -Eq "DNS:(${WWW_DOMAIN}|\*\.${DOMAIN})(,|\$)"; then
  echo "ВНИМАНИЕ: сертификат не покрывает ${WWW_DOMAIN} — по адресу с www браузер покажет ошибку."
fi

if ! openssl x509 -in "$LEAF" -noout -checkend 0 >/dev/null; then
  echo "" >&2
  echo "Срок действия сертификата уже истёк — продлите его у продавца и запустите скрипт с новыми файлами." >&2
  exit 1
fi
if ! openssl x509 -in "$LEAF" -noout -checkend $((30 * 24 * 3600)) >/dev/null; then
  echo "ВНИМАНИЕ: сертификат истекает меньше чем через 30 дней — не забудьте продлить."
fi

cat "$LEAF" > "$WORK/fullchain.pem"
for c in "${CHAIN[@]+"${CHAIN[@]}"}"; do
  cat "$c" >> "$WORK/fullchain.pem"
done

verify_args=()
if [ "${#CHAIN[@]}" -gt 0 ]; then
  for c in "${CHAIN[@]}"; do cat "$c"; done > "$WORK/untrusted.pem"
  verify_args+=(-untrusted "$WORK/untrusted.pem")
fi
[ -n "$ROOT" ] && verify_args+=(-CAfile "$ROOT")
if openssl verify "${verify_args[@]+"${verify_args[@]}"}" "$LEAF" >/dev/null 2>&1; then
  echo "Цепочка сертификатов проверена."
else
  echo ""
  if [ "${#CHAIN[@]}" -eq 0 ]; then
    echo "ВНИМАНИЕ: не найден промежуточный сертификат. Без него сайт может не открываться на части"
    echo "телефонов и в некоторых программах. Скачайте его у продавца сертификата и запустите скрипт снова."
  else
    echo "ВНИМАНИЕ: openssl не смог проверить цепочку до доверенного корня. Если в браузере сайт открывается"
    echo "без предупреждений — всё в порядке; иначе проверьте, что промежуточный сертификат тот самый."
  fi
  read -r -p "Установить сертификат всё равно? (y/N): " CONTINUE
  [[ "${CONTINUE:-}" == "y" || "${CONTINUE:-}" == "Y" ]] || exit 1
fi

# --- Установка ---
mkdir -p "$CERTS_DIR"
CERT_FILE="$CERTS_DIR/${DOMAIN}.pem"
KEY_FILE="$CERTS_DIR/${DOMAIN}.key"
STAMP="$(date +%s)"
[ -f "$CERT_FILE" ] && cp "$CERT_FILE" "${CERT_FILE}.bak.${STAMP}"
[ -f "$KEY_FILE" ] && cp "$KEY_FILE" "${KEY_FILE}.bak.${STAMP}"
PREV_CONF=""
if [ -f "$NGINX_ACTIVE" ]; then
  PREV_CONF="$WORK/active.conf.prev"
  cp "$NGINX_ACTIVE" "$PREV_CONF"
fi

cp "$WORK/fullchain.pem" "$CERT_FILE"
install -m 600 "$WORK/key.pem" "$KEY_FILE"
cp frontend/nginx/https-own.conf "$NGINX_ACTIVE"

echo ""
echo "Сертификат установлен в ${CERT_FILE}, nginx переключён на HTTPS."

if docker compose ps frontend 2>/dev/null | grep -q "Up"; then
  if docker compose exec frontend nginx -t >/dev/null 2>&1; then
    docker compose exec frontend nginx -s reload
    echo "nginx перезагружен."
  else
    echo "" >&2
    echo "nginx не принял новую конфигурацию — возвращаю прежнюю:" >&2
    docker compose exec frontend nginx -t >&2 || true
    if [ -n "$PREV_CONF" ]; then
      cp "$PREV_CONF" "$NGINX_ACTIVE"
    else
      cp frontend/nginx/http.conf "$NGINX_ACTIVE"
    fi
    exit 1
  fi
else
  echo "Контейнер frontend сейчас не запущен — конфигурация подхватится при следующем 'docker compose up -d'."
fi

echo ""
echo "=================================="
echo " Готово"
echo "=================================="
echo "Сайт должен открываться по https://${DOMAIN}"
echo "Проверьте, что порт 443 открыт наружу (в файрволе сервера / группе безопасности облака)."
echo "Сертификат не продлевается сам: когда купите продление — запустите этот скрипт с новыми файлами."
