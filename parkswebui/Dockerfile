# Build stage
FROM node:23-alpine

WORKDIR /app

COPY . .

RUN npm install -g serve

EXPOSE 4000

CMD ["serve", "-s", "webui", "-l", "4000"]