FROM node:22-alpine AS build

WORKDIR /app
RUN npm i -g bun
COPY ./client/package*.json ./
RUN bun ci
COPY ./client .
RUN bun run build

FROM node:22-alpine

RUN npm i -g bun
RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY ./server/package*.json ./
USER node
RUN bun ci
COPY --chown=node:node ./server .
RUN bun run build
COPY ./server .
COPY --from=build /app/dist /app/public

EXPOSE 3000

CMD ["node", "dist/main"]
