# ТЗ: Life Notebook — Персональный мобильный дневник жизни

**Автор:** Sergey Sholokhov  
**Версия:** 1.1  
**Дата:** 02 мая 2026  
**Статус:** актуальное ТЗ для v1

---

## 1. Суть продукта

Life Notebook — приватное мобильное приложение для личного использования.  
Основная идея: один инструмент, куда можно быстро записать всё — задачи, мысли, бытовые дела, эмоции, заметки после психолога, что-то по машине или дому — и не потерять.

**Аналогия:** большой личный блокнот в формате мобильного приложения с быстрым доступом, полнотекстовым поиском и структурой, которая растёт вместе с нуждами.

**Принципы:**

- Скорость записи важнее красоты интерфейса
- Структура мягкая, не жёсткая — разделы и подразделы добавляются свободно
- Данные хранятся локально на устройстве, синхронизируются на сервер
- Приватность: защита Face ID / PIN, только для одного пользователя
- Приоритет — телефон (80%), компьютер через браузер (20%)

---

## 2. Сценарии использования

| Сценарий | Устройство | Частота |
|---|---|---|
| Быстро записать мысль / задачу | iPhone 16 Pro | Ежедневно, много раз |
| Записать эмоцию после контакта с бывшей женой | iPhone | После каждого контакта |
| Вести заметки после сеанса с психологом | iPhone / ПК | ~1–2 раза в неделю |
| Посмотреть список задач / покупок | iPhone | Ежедневно |
| Добавить запись по дому / машине / работе | iPhone / ПК | По ситуации |
| Просмотр всех записей, поиск | iPhone / ПК | Периодически |
| Экспорт / резервная копия | ПК | Редко |

---

## 3. Платформы

| Платформа | Формат | Приоритет |
|---|---|---|
| iPhone 16 Pro | React Native (Expo) — нативное приложение | ★★★ Основной |
| Android | То же Expo-приложение | Задел на будущее |
| Desktop (Chrome/Safari) | Expo Web — веб-версия того же кода | 20% сценариев |

**Нет** отдельного Electron/Tauri десктоп-приложения — для компьютера достаточно веб-версии.

---

## 4. Технический стек

### Frontend / Mobile (единая кодовая база)

| Компонент | Технология | Причина |
|---|---|---|
| Фреймворк | **React Native** | Нативный UI на iOS/Android |
| Платформа | **Expo SDK 52+** | Сборка без Mac, удобный dev experience |
| Язык | **TypeScript** | Типизация, меньше ошибок |
| Стили | **NativeWind v4** | Tailwind-синтаксис в RN, привычно |
| Навигация | **Expo Router v3** | File-based routing, поддержка web |
| Локальная БД | **expo-sqlite** | Настоящий SQLite на устройстве, данные не чистятся |
| ORM (клиент) | **Drizzle ORM** | TypeScript-first, работает с expo-sqlite |
| Состояние | **Zustand** | Лёгкий, минималистичный |
| HTTP-клиент | **axios** | Привычно, удобные interceptors для токенов |
| Биометрия | **expo-local-authentication** | Face ID на iPhone |
| Уведомления | **expo-notifications** | Локальные напоминания |
| Иконки | **@expo/vector-icons** | Встроены в Expo |

### Инструменты разработки

| Инструмент | Назначение |
|---|---|
| **WebStorm** | Основная IDE: React Native + TypeScript |
| **Expo Go** (iPhone) | Живой просмотр во время разработки |
| **EAS Build** | Облачная сборка iOS .ipa без Mac |
| **TestFlight** | Установка на iPhone без App Store |
| **PyCharm** | FastAPI backend |
| **Docker Desktop** | PostgreSQL локально |

### Backend

| Компонент | Технология | Причина |
|---|---|---|
| API | **FastAPI** | Привычный стек |
| ORM | **SQLModel** | Лаконичные модели поверх SQLAlchemy |
| БД | **PostgreSQL** | Надёжно для личного хранения |
| Миграции | **Alembic** | Стандарт для FastAPI/SQLAlchemy |
| Авторизация | **JWT** (access + refresh tokens) | Знакомо по другим проектам |
| Деплой | **Docker Compose** на VPS | Привычно |

### Инфраструктура (VPS)

```
VPS (минимум 1 vCPU / 1 ГБ RAM / 20 ГБ SSD)
├── nginx (reverse proxy + SSL / Let's Encrypt)
├── backend (FastAPI + Uvicorn)
└── db (PostgreSQL)
```

---

## 5. Структура проекта

```
life-notebook/
├── apps/
│   ├── mobile/                        # React Native + Expo
│   │   ├── app/                       # Expo Router (file-based)
│   │   │   ├── (auth)/
│   │   │   │   └── login.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx          # Сегодня (Home)
│   │   │   │   ├── todo.tsx           # To-do
│   │   │   │   ├── psychology.tsx     # Психолог
│   │   │   │   └── sections.tsx       # Разделы
│   │   │   ├── search.tsx
│   │   │   ├── settings.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/                # UI-компоненты
│   │   │   ├── ui/                    # Базовые: Button, Card, Sheet, Badge
│   │   │   ├── todo/
│   │   │   ├── emotions/
│   │   │   └── sections/
│   │   ├── lib/
│   │   │   ├── db/                    # expo-sqlite + Drizzle схема и миграции
│   │   │   ├── sync/                  # Логика синхронизации push/pull
│   │   │   ├── api/                   # axios-клиент к FastAPI
│   │   │   ├── store/                 # Zustand-сторы
│   │   │   └── utils/
│   │   ├── types/                     # Общие TypeScript-типы
│   │   ├── assets/
│   │   ├── app.json                   # Expo config
│   │   ├── eas.json                   # EAS Build config
│   │   └── tailwind.config.js         # NativeWind
│   │
│   └── api/                           # FastAPI
│       ├── app/
│       │   ├── models/                # SQLModel-модели
│       │   ├── routers/               # auth, notes, tasks, emotions, sections, sync
│       │   ├── db/                    # base.py, session
│       │   └── core/                  # settings, security (JWT)
│       ├── alembic/
│       └── Dockerfile
│
├── infra/
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── SPEC.md                            # Этот файл (живое ТЗ)
├── CHANGELOG.md                       # Лог изменений в решениях
└── README.md
```

---

## 6. Модели данных

### Принцип: local-first + sync

Каждая запись создаётся локально в SQLite → помечается `is_synced = false` → при наличии сети синхронизируется с сервером.

Поля синхронизации присутствуют у каждой сущности:

```
id            TEXT (UUID)   первичный ключ, генерируется на клиенте
created_at    TEXT          ISO8601 datetime
updated_at    TEXT          ISO8601 datetime, обновляется при каждом изменении
deleted_at    TEXT|NULL     мягкое удаление (null = активная запись)
is_synced     INTEGER       только в локальной SQLite: 0 = pending, 1 = synced
```

### Note (Заметка)
```
id, user_id, title, body (text),
section_id (FK, nullable),
tags (JSON array),
is_pinned (bool),
created_at, updated_at, deleted_at, is_synced
```

### Task (Задача / To-do)
```
id, user_id, title,
is_done (bool), done_at (nullable),
due_date (nullable),
category (enum: shopping | home | car | work | personal),
section_id (FK, nullable),
position (int, для ручной сортировки),
created_at, updated_at, deleted_at, is_synced
```

### Section (Раздел)
```
id, user_id,
name, icon (emoji), color (hex),
description (nullable),
parent_id (FK nullable — для вложенных разделов),
position (int),
created_at, updated_at, deleted_at, is_synced
```

### EmotionLog (Журнал эмоций)
```
id, user_id,
emotion (string — из списка ниже),
emotion_category (enum: joy | anger | sadness | fear | shame | calm | other),
situation (text),
body_reaction (text, nullable),
thought (text, nullable),
desired_action (text, nullable),
context_tag (string, nullable — напр. "контакт с Катей", "рабочее"),
created_at, updated_at, deleted_at, is_synced
```

### Attachment (Вложение)
```
id, user_id,
entity_id (UUID), entity_type (enum: note | task | emotion_log),
filename, mime_type,
local_path (путь на устройстве),
storage_path (путь на сервере, nullable до синка),
size_bytes,
created_at, deleted_at, is_synced
```

### DeviceSyncState
```
device_id (UUID, генерируется при первом запуске),
user_id,
last_sync_at (ISO8601),
pending_count (int)
```

---

## 7. Список эмоций (из задания психолога)

### Радость
Радость, Восторг, Надежда, Гордость, Нежность, Благодарность, Восхищение, Любовь, Умиротворение, Умиление, Безмятежность, Воодушевление, Азарт, Ликование, Симпатия, Предвкушение

### Гнев
Гнев, Раздражение, Возмущение, Недовольство, Отвращение, Презрение, Бешенство, Обида, Злость, Досада, Зависть, Негодование, Злорадство, Неприязнь, Ревность

### Печаль
Печаль, Грусть, Разочарование, Тоска, Сочувствие, Отчаяние, Скорбь, Сожаление, Огорчение, Жалость, Горе

### Страх
Страх, Беспокойство, Тревога, Ужас, Паника, Испуг, Волнение, Настороженность, Боязнь, Опасение, Трепет

### Стыд
Стыд, Вина, Смущение, Неловкость, Неудобство

---

## 8. Синхронизация (Sync v1)

Простая схема: batch push + pull по `updated_at`.

**Push:** клиент собирает все записи с `is_synced = 0` и отправляет одним запросом.  
**Pull:** клиент запрашивает все записи где `updated_at > last_sync_at`.  
**Конфликты v1:** last-write-wins по `updated_at`.

```
POST /api/sync/push   body: { items: SyncItem[] }
                      → { accepted: UUID[], conflicts: SyncItem[] }

POST /api/sync/pull   body: { since: ISO8601, device_id: UUID }
                      → { items: SyncItem[], server_time: ISO8601 }
```

**Триггеры синхронизации:**
- При старте приложения (если есть сеть)
- При возвращении приложения из фона (`AppState` change)
- После каждого локального изменения с debounce 5 секунд
- Ручной pull-to-refresh на любом экране

---

## 9. API FastAPI

### Auth
```
POST /api/auth/login      body: { username, password } → { access_token, refresh_token }
POST /api/auth/refresh    body: { refresh_token }       → { access_token }
POST /api/auth/logout     header: Bearer token          → 200 OK
```

### CRUD (notes, tasks, sections, emotion-logs)
```
GET    /api/{entity}/         ?page, limit, section_id, deleted
POST   /api/{entity}/         body: EntityCreate
GET    /api/{entity}/{id}
PATCH  /api/{entity}/{id}     body: EntityUpdate (partial)
DELETE /api/{entity}/{id}     → мягкое удаление (deleted_at = now)
```

### Sync
```
POST /api/sync/push
POST /api/sync/pull
```

### Search
```
GET /api/search?q=...&types=notes,tasks,emotions&limit=20
```

### Export
```
GET /api/export/json    → полный JSON всех данных пользователя
GET /api/export/zip     → JSON + вложения архивом
```

---

## 10. Экраны (v1)

### Сегодня (Home / index.tsx)
- Дата и приветствие
- Счётчики: активных задач, записей за сегодня, эмоций за неделю
- Быстрые действия (3 кнопки): добавить задачу, заметку, эмоцию → открывают Bottom Sheet
- Блок "Ближайшие задачи" (3–5 штук)
- Блок "Разделы" (карточки-папки)
- Pull-to-refresh

### Inbox (часть Home или отдельный таб)
- Список необработанных заметок
- FAB для быстрого добавления
- Свайп по записи → переместить в раздел / удалить

### To-do (todo.tsx)
- Фильтры-чипы: Все / Сегодня / Покупки / Дом / Авто / Работа
- Список задач с чекбоксами
- Свайп → выполнить / удалить
- FAB → Bottom Sheet создания задачи

### Психолог (psychology.tsx)
- Кнопки быстрого выбора эмоции (8 основных + "другая")
- Форма записи: ситуация → эмоция → реакция тела → мысль → желаемое действие
- Тег контекста (напр. "контакт с Катей")
- Журнал: хронологический список записей с эмоцией и датой
- Возможность открыть запись и дочитать/дополнить

### Разделы (sections.tsx)
- Сетка карточек разделов
- Начальные разделы: Дом 🏠, Автомобиль 🚗, Работа 💼, На потом 🗂️
- Внутри раздела: список заметок + задач, кнопка создания
- Кнопка "Добавить раздел" — всегда видна

### Поиск (search.tsx)
- Единое поле поиска
- Результаты из заметок, задач, эмоций одновременно
- Тип записи указан значком/меткой у каждого результата

### Настройки (settings.tsx)
- Смена темы (тёмная / светлая / системная)
- Биометрия / PIN (expo-local-authentication)
- Синхронизация: статус, дата последнего синка, ручной запуск
- Экспорт всех данных (JSON / ZIP)
- Версия приложения

---

## 11. UX/UI-требования

- **Приоритет: iPhone 16 Pro** (393 × 852pt, Dynamic Island)
- Тёмная и светлая тема, переключение в настройках и по системной теме
- **Bottom Tab Bar:** 4 таба — Сегодня, To-do, Психолог, Разделы
- **FAB** (floating action button) на каждом экране для быстрого создания
- **Bottom Sheet** (не полноэкранные модалки) для форм создания — `@gorhom/bottom-sheet`
- Touch targets минимум **44×44pt**
- Тело (body text) минимум **16pt**
- **Safe Area** — учитывать Dynamic Island и home indicator
- **Pull-to-refresh** на всех списочных экранах
- Анимации: переходы между экранами, Bottom Sheet ease-out вверх
- **Offline-ready:** все экраны работают без сети, синк — фоново
- **Swipe actions** на элементах списков (выполнить, удалить, переместить)

---

## 12. Безопасность

- Один пользователь, аккаунт создаётся вручную через seed или settings
- JWT: access token (15 мин) + refresh token (30 дней)
- Биометрия / PIN через `expo-local-authentication` как второй слой защиты
- HTTPS обязательно на сервере (Let's Encrypt / nginx)
- Все данные привязаны к `user_id`, сервер не отдаёт чужие записи

---

## 13. Этапы разработки

### Этап 1 — Локальный MVP на телефоне (без сервера)
**Цель:** приложение работает на iPhone, данные в локальной SQLite.

- [ ] `npx create-expo-app life-notebook --template` (TypeScript)
- [ ] Настройка NativeWind v4
- [ ] Настройка Expo Router (tabs layout)
- [ ] expo-sqlite + Drizzle: схема таблиц (tasks, notes, sections, emotion_logs)
- [ ] Zustand сторы для каждой сущности
- [ ] Экран "Сегодня": счётчики, быстрые действия, превью задач
- [ ] Экран "To-do": список, чекбоксы, создание через Bottom Sheet
- [ ] Bottom Tab Bar, FAB, Bottom Sheet (@gorhom/bottom-sheet)
- [ ] Dark mode + light mode (NativeWind)
- [ ] Запуск через Expo Go на iPhone ✅

### Этап 2 — Психолог и Разделы
**Цель:** все основные экраны из ТЗ работают локально.

- [ ] Экран "Психолог": выбор эмоции, форма, журнал
- [ ] Полный список эмоций по категориям (из раздела 7)
- [ ] Экран "Разделы": карточки, начальные разделы, создание нового
- [ ] Внутренний экран раздела: заметки + задачи
- [ ] Экран "Поиск"
- [ ] Экран "Настройки" (тема, биометрия — заглушки)
- [ ] Swipe actions на списках

### Этап 3 — Backend + Sync
**Цель:** данные синхронизируются между устройствами.

- [ ] FastAPI проект: структура, модели, CRUD
- [ ] Docker Compose: FastAPI + PostgreSQL
- [ ] JWT авторизация
- [ ] Sync API: push/pull
- [ ] Клиентская логика синхронизации в `lib/sync/`
- [ ] Деплой на VPS, SSL, nginx
- [ ] EAS Build → TestFlight → установка на iPhone как настоящее приложение

### Этап 4 — Polish + расширения
**Цель:** довести до личного production-качества.

- [ ] Вложения (фото к заметкам и записям)
- [ ] Теги и фильтрация по тегам
- [ ] Экспорт JSON / ZIP
- [ ] Face ID / PIN блокировка
- [ ] Локальные уведомления-напоминания
- [ ] Виджет на экран блокировки (expo-widgets — задел)
- [ ] Android сборка (вторично)

---

## 14. Out of scope (v1)

- Шаринг с другими пользователями
- Иерархия разделов глубже 2 уровней
- AI-функции (саммари, анализ эмоций)
- Real-time коллаборация
- Публичные записи
- Интеграция с Apple Calendar / Reminders

---

## 15. Критерии готовности

**Экран готов**, если:
- Работает на iPhone без сети (локальная SQLite)
- Поддерживает тёмную и светлую тему
- Touch targets ≥ 44pt, текст ≥ 16pt
- Форма создания открывается и сохраняет данные

**Этап готов**, если:
- Все чекбоксы этапа выполнены
- Можно пользоваться приложением каждый день без потери данных

---

## 16. Лог изменений стека

| Дата | Изменение | Причина |
|---|---|---|
| 01.05.2026 | Начальный вариант: Capacitor + IndexedDB | Первая версия |
| 02.05.2026 | **Смена стека: React Native + Expo + expo-sqlite** | Нет Mac → нельзя собирать Capacitor iOS. Expo решает через EAS Build (облако). expo-sqlite надёжнее IndexedDB на iOS. |
| 02.05.2026 | Drizzle ORM вместо сырых SQL-запросов | TypeScript-first, хорошая интеграция с expo-sqlite |
| 02.05.2026 | IDE: WebStorm (мобайл) + PyCharm (backend) | Уже установлено на рабочей машине |

---

*Документ является живым ТЗ. При изменении архитектурных решений — обновлять раздел 16 (Лог изменений стека).*
