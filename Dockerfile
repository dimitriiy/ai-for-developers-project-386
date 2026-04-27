ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS frontend-build


WORKDIR /app/frontend

COPY frontend/package*.json yarn.lock ./

RUN yarn install

COPY frontend/ ./

RUN yarn build



FROM node:${NODE_VERSION} AS backend-build
WORKDIR /app/backend

COPY backend/package*.json yarn.lock ./

RUN yarn install

COPY backend/ ./

RUN yarn build


FROM node:${NODE_VERSION} AS production

ENV NODE_ENV=production

COPY backend/package.json backend/уyarn.lock ./

RUN yarn install --immutable --production

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "dist/server.js"]