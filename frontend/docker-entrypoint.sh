#!/bin/sh
# Раз в 12 часов перечитывает конфиг/сертификат без остановки nginx —
# нужно, чтобы продлённый certbot'ом сертификат подхватывался автоматически.
set -e

(
  while true; do
    sleep 43200
    nginx -s reload 2>/dev/null || true
  done
) &

exec nginx -g 'daemon off;'
