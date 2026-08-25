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

Скрипт задаст несколько вопросов (с пояснениями, что и зачем) и поднимет весь стек по HTTP.

Когда DNS `prival.pro` и `www.prival.pro` будет указывать на этот сервер — включите HTTPS:

```bash
./scripts/init-letsencrypt.sh
```

Сертификат Let's Encrypt выпускается и дальше продлевается автоматически. Домен захардкожен в `frontend/nginx/*.conf` как `prival.pro` — при смене домена поменяйте его там.

## Обновление после изменений в коде

```bash
git pull
docker compose up -d --build
```
