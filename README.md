# Система виявлення аномалій — Anomaly Detector

**Короткий опис**

Репозиторій містить бекенд-сервіс для генерування, зберігання та аналізу часових рядів забруднювачів повітря з метою виявлення аномалій. Також додано простий React-компонент для візуалізації результатів та інтерактивної роботи з параметрами аналізу. Є додаткові маршрути для тестових даних (NASA example) і утиліти для seed-даних.

---

## Основні можливості

* Підключення до MongoDB (Mongoose).
* Модель `AnomalyData` з полями для метаданих, ковзної статистики та позначок аномалій.
* Генератор синтетичних даних (`generateSyntheticData`) з контролем інтервалу, днів та типів аномалій.
* Алгоритм виявлення аномалій (`detectAnomalies`) на основі ковзного середнього, стандартного відхилення (μ + kσ) та добового P95.
* REST API: створення точок, отримання даних, генерація синтетики, аналіз, статистика.
* Простий React UI `AnomalyDetector` з візуалізацією, панеллю налаштувань та нативними сповіщеннями браузера.
* Скрипт seed для HealthRisk (генерація тестових записів).

---

## Структура проекту (ключові файли)

```
/ (root)
├─ app.js                   # Express app
├─ server.js                # Точка входу (startServer)
├─ src/
│  ├─ config/database.js    # Підключення до MongoDB
│  ├─ controllers/anomalyController.js
│  ├─ models/AnomalyData.js
│  ├─ routes/anomalyRoutes.js
│  ├─ utils/anomalyDetector.js
│  ├─ utils/syntheticDataGenerator.js
│  └─ seed/seedHealthRisk.js
├─ client/                  # React компонент (AnomalyDetector + стилі)
│  ├─ src/AnomalyDetector.jsx
│  └─ src/AnomalyDetector.css
├─ packages/                # (опціонально) клієнтський axios client
└─ README.md
```

---

## Технологічний стек

* Node.js (ES Modules)
* Express
* MongoDB + Mongoose
* React (фронтенд компонент)
* Axios
* dotenv

---

## Вимоги / Prerequisites

* Node.js 18+ (або сумісна LTS-версія)
* MongoDB (локально або cloud URI)
* npm або yarn

---

## Налаштування середовища (ENV)

Створіть файл `.env` у корені проекту та додайте як мінімум:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/anomalydb
```

Якщо використовуєте інші порти або окремий порт для NASA-API client — додайте відповідно.

---

## Інструкція з установки та запуску (локально)

1. Клонувати репозиторій

```bash
git clone <URL-репо>
cd <repo-folder>
```

2. Інсталювати залежності сервера

```bash
npm install
# або
# yarn install
```

3. Запустити сервер

```bash
npm run start
# або для дев-режиму з nodemon
npm run dev
```

Сервер повідомить у консолі про успішне підключення до MongoDB та порт.

4. (Опціонально) Запустити клієнтський додаток React

Якщо фронтенд знаходиться у підпапці `client`:

```bash
cd client
npm install
npm start
```

---

## REST API — коротка документація

**Базовий префікс:** `/api/anomaly`

### POST `/api/anomaly/generate`

Генерує синтетичні дані та зберігає їх у колекції (позначені `isSynthetic: true`).

**Тіло запиту (JSON):**

```json
{
  "pollutant": "PM2.5",
  "days": 7,
  "measurementInterval": 15,
  "stationId": "station_1"
}
```

**Відповідь:** повідомлення та перші 10 записів.

---

### POST `/api/anomaly/analyze`

Аналізує наявні дані для зазначеного забруднювача/станції та повертає результат.

**Тіло запиту (JSON):**

```json
{
  "pollutant": "PM2.5",
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-07T23:59:59Z",
  "windowSize": 120,
  "thresholdFactor": 3,
  "minDuration": 30,
  "stationId": "station_1"
}
```

**Повідомлення про помилки:** повертає `400` якщо точок < 24.

---

### GET `/api/anomaly/data`

Отримати дані з фільтрами.

**Параметри query:** `pollutant`, `startDate`, `endDate`, `limit`, `stationId`, `onlyAnomalies=true`

---

### POST `/api/anomaly/data`

Додає одну точку даних.

**Тіло запиту (JSON):**

```json
{
  "stationId": "station_1",
  "pollutant": "PM2.5",
  "timestamp": "2025-12-10T09:00:00Z",
  "value": 35.2,
  "measurementInterval": 15
}
```

---

### GET `/api/anomaly/statistics`

Повертає статистику за проміжок (за замовчуванням останні `days=7`). Відповідь містить: `totalPoints`, `anomalyCount`, `averageValue`, `maxValue`, `minValue`, `p95Value`, `recentMean`, `recentStd`, `upperThreshold`.

**Query-параметри:** `pollutant`, `stationId`, `days`

---

## Опис алгоритму виявлення аномалій

Алгоритм виконує наступні кроки:

1. Сортування точок за часом.
2. Обчислення ковзного середнього та ковзного стандартного відхилення у вікні (кількість точок = `windowSize / measurementInterval`).
3. Порогова перевірка: точка вважається спайком якщо `value > movingAverage + thresholdFactor * movingStd`.
4. Додаткова перевірка: якщо значення перевищує добовий P95 — також розглядається як потенційна аномалія.
5. Агрегування точок у події (анома́лії) з мінімальною тривалістю `minDuration`.
6. Повернення аномалій та масиву даних з позначками `isAnomaly`, `anomalyType`, `movingAverage`, `movingStd`.

---

## Модель даних — `AnomalyData` (важливі поля)

* `stationId` — ідентифікатор станції
* `pollutant` — тип забруднювача (`PM2.5`, `NO2`, `SO2`, `O3`, `CO`, `PM10`)
* `timestamp` — дата/час вимірювання
* `value` — числове значення концентрації
* `isAnomaly`, `anomalyType` — прапори виявлених аномалій
* `movingAverage`, `movingStd`, `upperThreshold` — ковзні статистики
* `measurementInterval` — інтервал вимірювань (хв)

---

## Приклади запитів (curl)

Генерація синтетичних даних:

```bash
curl -X POST http://localhost:3000/api/anomaly/generate \
  -H "Content-Type: application/json" \
  -d '{"pollutant":"PM2.5","days":7,"measurementInterval":15,"stationId":"station_1"}'
```

Аналіз:

```bash
curl -X POST http://localhost:3000/api/anomaly/analyze \
  -H "Content-Type: application/json" \
  -d '{"pollutant":"PM2.5","days":7,"windowSize":120,"thresholdFactor":3,"minDuration":30}'
```

Отримати тільки аномалії:

```bash
curl "http://localhost:3000/api/anomaly/data?onlyAnomalies=true&pollutant=PM2.5&stationId=station_1"
```

---


