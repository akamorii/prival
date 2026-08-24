# Привал — бэкенд

FastAPI + PostgreSQL. Хранит меню и заказы, отправляет письмо о новом заказе на почту, настроенную в админ-панели.

## Локальный запуск без Docker

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # заполнить JWT_SECRET и ENCRYPTION_KEY (см. комментарии в .env.example корня проекта)
alembic upgrade head
python -m app.seed     # заполняет меню и дефолтные настройки
uvicorn app.main:app --reload
```

API поднимется на `http://localhost:8000`, документация — `http://localhost:8000/docs`.

## Структура

```
app/
  main.py        сборка FastAPI-приложения, роуты, CORS
  config.py      настройки из переменных окружения
  database.py    engine/session SQLAlchemy
  models.py      ORM-модели (Category, Dish, Order, OrderItem, AppSettings)
  schemas.py     Pydantic-схемы запросов/ответов (camelCase на границе с фронтендом)
  security.py    JWT для админки, шифрование пароля приложения (Fernet)
  mailer.py      отправка письма о заказе через SMTP
  routers/       обработчики эндпоинтов, по одному файлу на сущность (включая uploads.py — загрузка фото блюд)
  seed_data.py   исходные данные меню (изначально перенесены из PDF меню кафе)
  seed.py        разовое заполнение БД сид-данными
alembic/         миграции схемы БД
uploads/         загруженные фото блюд (в Docker — отдельный volume, см. docker-compose.yml)
```

## Важное про письма

Настройки отправки (email отправителя, пароль приложения, email получателя) задаются в админ-панели (`/admin/settings`), а не в переменных окружения — их можно менять без пересборки. Пароль приложения хранится в БД в зашифрованном виде (`ENCRYPTION_KEY`). Если письмо не удалось отправить (не настроено, недоступен SMTP), заказ всё равно остаётся сохранённым в БД — таково явное требование ТЗ.

## Фото блюд

`POST /api/uploads` (только для авторизованного админа) принимает файл изображения (JPEG/PNG/WEBP/GIF, до 5 МБ), сохраняет его в `uploads/` и возвращает `{"url": "/uploads/<файл>"}`. Этот путь и сохраняется в поле `photoUrl` блюда. Раздаётся статикой на `/uploads/*` тем же бэкендом.
