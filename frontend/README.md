# Привал — фронтенд

React (Vite + TypeScript) фронтенд для QR-заказа со стола. Ходит в бэкенд (FastAPI) через `src/shared/api/*` — по умолчанию по относительным путям (`/api/...`), которые в docker-compose проксирует nginx на сервис `backend`.

## Запуск

Локально без Docker нужен отдельно запущенный бэкенд (см. `backend/README.md`):

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8000, т.к. своего nginx-прокси тут нет
npm run dev
```

Гостевая часть: `http://localhost:5173/?table=3`
Админка: `http://localhost:5173/admin` (код доступа задаётся на бэкенде переменной `ADMIN_PASSCODE`)

Через `docker compose up` (из корня проекта) отдельная настройка не нужна — см. корневой `README`/`.env.example`.

## Структура

```
src/
  app/            роутинг
  pages/guest/    меню, корзина, оформление заказа, экран успеха
  pages/admin/    заказы, меню, QR-коды столов, отчёты, настройки почты
  widgets/        составные блоки экрана (карточка блюда, нижняя панель корзины и т.д.)
  entities/       доменные сущности (блюдо, меню)
  shared/         типы, HTTP-клиент к бэкенду, конфиг, переиспользуемый UI-кит
  store/          zustand-стор корзины
```
