<p align="center">
  <img src="public/logo.svg" alt="Coopera" width="80" />
</p>

<h1 align="center">Coopera — Frontend</h1>

<p align="center">
  Платформа для командной работы с авторизацией через Telegram
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.2.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
</p>

---

## О проекте

Coopera — веб-приложение для управления командными задачами. Вместо привычной регистрации по email используется авторизация через Telegram: пользователь нажимает кнопку, переходит в бота, и сразу попадает в рабочее пространство своей команды.

Приложение построено вокруг трёх идей:

- **Минимум трения.** Нет паролей, нет email-подтверждений — Telegram-аккаунт уже есть у каждого участника команды.
- **Контекст на виду.** Канбан, лента активности и аналитика живут в одном интерфейсе, не требуя переключения между инструментами.
- **Живые данные.** Задачи обновляются каждые 5 секунд, оптимистичные обновления делают интерфейс отзывчивым даже при медленном соединении.

Фронтенд — SPA на React 19, архитектура Feature-Sliced Design, серверный стейт через TanStack Query.

## Возможности

### Авторизация
- Вход через Telegram Bot (веб) и Telegram Mini App
- Защищённые маршруты с persist-сессией через sessionStorage

### Команды
- Создание команд с кастомным эмодзи и цветом
- Управление участниками: добавление, удаление, приглашение по Telegram username
- Настройка автоназначения задач и фото команды

### Задачи
- Канбан-доска с 4 колонками и drag-and-drop
- Создание задач с заголовком, описанием, приоритетом, тегами и очками
- Назначение исполнителей, оптимистичные обновления, автообновление каждые 5 с
- Комментарии к задачам в реальном времени

### Аналитика
- Бенто-дашборд: активные задачи и статистика пользователя
- Персональная аналитика: тепловая карта активности, рейтинг по задачам
- Профили участников команды со статистикой задач

### Кастомизация
- Тёмная и светлая тема
- Анимированные обои (aurora, ocean, meadow, paper, grid) + загрузка своего изображения

### Уведомления
- Лента активности с историей действий команды
- Отметка уведомлений как прочитанных, очистка ленты

## Стек технологий

| Инструмент | Версия | Роль |
|-----------|--------|------|
| React | 19.2.0 | UI-фреймворк |
| TypeScript | 5.9.3 | Строгая типизация |
| Vite | 7.2.2 | Сборщик |
| react-router-dom | 7.9.6 | Маршрутизация |
| Zustand | 5.0.8 | Клиентский стейт |
| TanStack Query | 5.90.11 | Серверный стейт, кэш, мутации |
| Axios | 1.13.2 | HTTP (только auth-callback) |
| lucide-react | 1.14.0 | Иконки |
| sonner | — | Toast-уведомления |
| Sentry | 10.28.0 | Мониторинг ошибок |
| Vitest + Testing Library | 3.2.4 / 16.3.0 | Тесты |

Архитектура — [Feature-Sliced Design](https://feature-sliced.design/).

## Развёртывание

Фронтенд работает совместно с бэкендом (Go REST API) и Telegram-ботом. Полные инструкции по запуску всей системы — в [`coopera/README.md`](../coopera/README.md).

### Локальный запуск

```bash
# 1. Клонировать репозиторий
git clone https://github.com/flavvvour/frontend-coopera.git
cd frontend-coopera

# 2. Установить зависимости
npm install

# 3. Создать файл окружения
cp .env.example .env

# 4. Запустить dev-сервер (порт 3000)
npm run dev
```

> Бэкенд должен быть запущен на `http://localhost:8080`. Vite автоматически проксирует туда все запросы `/api/*`.

### Переменные окружения

```env
VITE_TELEGRAM_BOT_NAME=your_bot_username   # username бота без @
VITE_API_URL=http://localhost:8080/api/v1  # базовый URL API
VITE_SENTRY_DSN=your_sentry_dsn            # DSN для Sentry (опционально)
```

### Продакшн-сборка

```bash
npm run build
```

Для публичного доступа без домена:

```bash
ssh -R 80:localhost:3000 serveo.net
```

## Структура проекта

```
src/
├── app/          # Router, глобальные стили, ProtectedRoute
├── pages/        # dashboard, teams, team-detail, personal-stats, login, landing
├── widgets/      # kanban-board, sidebar, notifications, profile, wallpaper
├── features/     # create-team, invite-member, auth-by-telegram, user-tasks
├── entities/     # task, team, user, membership, activity (API + маперы + типы)
└── shared/       # axios-клиент, store (Zustand), query-keys, UI-компоненты
```

## Скрипты

```bash
npm run dev            # dev-сервер :3000
npm run build          # tsc + vite build
npm run lint           # ESLint
npm run format         # Prettier
npm run test           # Vitest
npm run test:coverage  # Покрытие тестами
```

## Автор

**flavvvour** — [github.com/flavvvour](https://github.com/flavvvour)

## Лицензия

[MIT](LICENSE)
