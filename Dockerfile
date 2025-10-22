# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa de producción (sirviendo con Nginx)
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: si quieres tu propia configuración de Nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
