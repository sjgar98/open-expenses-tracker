FROM node:20-alpine

RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY package*.json ./
USER node
RUN npm ci
COPY --chown=node:node . .
RUN npm run build
COPY . .

EXPOSE 3000

CMD ["node", "dist/main"]
