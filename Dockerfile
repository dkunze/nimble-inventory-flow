FROM node:18
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install
COPY backend .

CMD ["node", "server.js"]
