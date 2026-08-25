# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# --- runtime stage ---
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /app-entrypoint.sh
RUN chmod +x /app-entrypoint.sh
# nginx/active.conf монтируется docker-compose'ом как volume — не копируем его сюда,
# чтобы переключение http.conf → https.conf (см. scripts/init-letsencrypt.sh) не требовало ребилда.

EXPOSE 80 443
ENTRYPOINT ["/app-entrypoint.sh"]
