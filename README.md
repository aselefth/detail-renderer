# Редактор моделей
### Приложение для генерации датасета на основе 3D-моделей

## Клиент

```bash
# Установка зависимостей
npm install
# Запуск приложения
npm run dev
# Запуск приложения с открытием в браузере
npm run dev -- --open
```
>*Приложение запустится на порту http://localhost:6765. Чтобы поменять порт, нужно открыть vite.config.ts и поменять ```server.port```*


## Обработка данных
```bash
# Установка зависимостей
poetry install
# Запуск обучения. Необходимо поменять путь к файлам в objectTracking/train/train.py
poetry run python objectTracking/train/train.py
```