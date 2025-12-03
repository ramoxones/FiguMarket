# Stage de build
FROM node:18-alpine AS build
WORKDIR /app

# Solo copiamos los archivos de dependencias primero
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Instalamos dependencias dentro del contenedor
RUN npm ci || yarn install --frozen-lockfile || pnpm i --frozen-lockfile

# Copiamos el resto del proyecto
COPY . .

# Construimos el frontend
RUN npm run build

# Stage de producción
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos la carpeta 'dist' desde el stage de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
