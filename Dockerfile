FROM node:18

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

COPY backend/src ./src

WORKDIR /app/backend/src

CMD ["node", "index.js"]
