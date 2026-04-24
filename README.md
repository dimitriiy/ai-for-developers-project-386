### Hexlet tests and linter status:
[![Actions Status](https://github.com/dimitriiy/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/dimitriiy/ai-for-developers-project-386/actions)

## Проект

Календарь бронирования услуг. Две условные роли: владелец календаря и гостевой пользователь.

## Роли и возможности

### Владелец календаря

- Один заранее заданный профиль (без регистрации и авторизации)
- Используется админская часть по умолчанию
- [x] Создание типов событий: задает id, название, описание и длительность в минутах
- [x] Просмотр страницы предстоящих встреч в едином списке (все типы событий)

### Гость

- Бронирует слоты без создания аккаунта и без входа в систему
- [x] Просмотр страницы с видами брони (название, описание, длительность)
- [x] Выбор типа события, открытие календаря и выбор свободного слота в ближайшие 14 дней
- [x] Создание бронирования на выбранный слот

## Правила бронирования

- На одно и то же время нельзя создать две записи, даже если это разные типы событий
- Доступные слоты формируются на 14 дней, начиная с текущей даты
- Гость может записаться только на свободный слот из этого окна

## Технологии

- Frontend: Vite 8 + React 19 + TypeScript 5.9 + Mantine UI
- ESLint 9, ES2023 target
- Архитектура: Feature-Sliced Design (FSD)

## Запуск

```bash
cd frontend
yarn dev       # Dev server на http://localhost:5173
yarn build     # Production сборка
yarn preview   # Просмотр production сборки
yarn lint      # ESLint
```

## Стиль кода

- Кавычки: одинарные
- Точка с запятой: обязательна
- Отступы: 2 пробела
- Line endings: LF
- Модули: ES modules
- Компоненты: PascalCase
- Функции/переменные: camelCase
- Константы: UPPER_SNAKE_CASE
- Интерфейсы/типы: PascalCase
- Named exports

## CI/CD

- Hexlet automated checking (`.github/workflows/hexlet-check.yml`)
- **Do not modify** the Hexlet workflow file
