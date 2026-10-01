# Привал

QR-заказ со стола для кафе: гость сканирует QR на столе → открывает меню → собирает заказ → отправляет. Заказ сохраняется в БД и уходит письмом на почту кафе. Простая админка: заказы и их статусы, меню, QR-коды столов, отчёты, настройки почты.

- `frontend/` — React + TypeScript + Vite, отдаётся через nginx.
- `backend/` — FastAPI + PostgreSQL.
- nginx (в контейнере `frontend`) отдаёт статику сайта и проксирует `/api/*` и `/uploads/*` на `backend` — сайт и API живут на одном домене, без CORS.

## Локальная разработка

```bash
cp .env.example .env
# впишите JWT_SECRET и ENCRYPTION_KEY (команды генерации — в комментариях .env.example)
docker compose up -d --build
```

Сайт: `http://localhost` (или `http://localhost:8080`, если меняли `FRONTEND_PORT`), админка — `/admin`.

## Продакшен на prival.pro

На сервере, где уже установлен Docker:

```bash
git clone <репозиторий> && cd prival
./scripts/deploy.sh
```

Скрипт задаст несколько вопросов (с пояснениями, что и зачем) и поднимет весь стек по HTTP — этого достаточно для работы, HTTPS не обязателен.

Когда (и если) понадобится HTTPS — два варианта на выбор:

**Let's Encrypt** (сертификат на сервере, нужен открытый порт 80 и DNS `prival.pro`/`www.prival.pro`, указывающий прямо на сервер):
```bash
./scripts/init-letsencrypt.sh
```
Выпускается и дальше продлевается автоматически.

**Cloudflare** (проще — не нужен ни DNS-A-record-на-сервер, ни открытый порт 80; домен подключается к Cloudflare, а сертификат нужен только для шифрования между Cloudflare и сервером):
```bash
./scripts/cloudflare-ssl.sh
```
Нужен API-токен Cloudflare (см. `.env.example`, `CF_API_TOKEN`) и включённый в Cloudflare прокси (оранжевое облако) + режим SSL/TLS «Full (strict)» — скрипт выведет точные шаги в конце.

Домен захардкожен в `frontend/nginx/*.conf` как `prival.pro` — при смене домена поменяйте его там.

## Обновление после изменений в коде

```bash
git pull
docker compose up -d --build
```
