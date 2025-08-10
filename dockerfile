# Готовый образ с уже установленными браузерами и нужными системными зависимостями
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

# Рабочая директория в контейнере
WORKDIR /app

# Сначала зависимости (быстрее кешируется)
COPY package*.json ./
RUN npm ci

# Копируем исходники
COPY . .

# Запускаем бота
CMD ["node", "src/index.js"]
