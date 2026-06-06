# MService — лендинг автосервиса (Гомель)

Статический сайт: `index.html` + `styles.css` + `main.js`.

## Локально

Откройте `index.html` в браузере или:

```bash
npx serve .
```

## GitHub Pages

Репозиторий настроен на публикацию из ветки `main` / папка `/ (root)`.

После push сайт будет доступен по адресу:

`https://<username>.github.io/mservice/`

В настройках репозитория → Pages можно привязать домен `mservice.by`.

## Tilda

Файл `tilda.html` — всё в одном блоке для вставки в T123.

## Формы

- Email: FormSubmit → `a-prom01@mail.ru`
- Telegram: только через serverless (`api/telegram.js` на Vercel/Netlify), токен не хранить в клиенте

## Структура

```
index.html      — главная страница
styles.css      — стили
main.js         — логика
tilda.html      — сборка для Tilda
api/telegram.js — serverless endpoint (Vercel)
```
