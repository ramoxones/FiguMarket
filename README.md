# FiguMarket 🚀


**FiguMarket** es un marketplace especializado en **figuras coleccionables de segunda mano**, donde los usuarios pueden publicar, seguir, vender figuras, destacar productos y contactar con otros usuarios para realizar compraventas.

El proyecto incluye **frontend, backend, base de datos** y está totalmente **dockerizado**, listo para desplegar o ejecutar en local.

---

## 🌐 Enlaces importantes

- **Proyecto desplegado en Hostinger:** [http://31.97.157.15/]
- **Repositorio GitHub:** [https://github.com/ramoxones/FiguMarket.git]

---

## 🐳 Levantar el proyecto con Docker

Para ejecutar **todas las partes del proyecto** en contenedores Docker:

```bash
docker compose up -d
```

### Puertos en Docker
- Backend: `8080`
- Frontend: `8081`
- MySQL: `3306`

EL BACKEND TARDA EN LEVANTARSE UN POCO, ESPERE A QUE SE INICIE COMPLETAMENTE PARA PROBAR LA WEB, POR ESO AL PRIMER ACCESO PUEDAS ENCONTRAR UN FRONTEND QUE PARECE QUE NO HACE FETCH A NADA.

### Variables de entorno MySQL (docker-compose.yml)
```env
MYSQL_DATABASE=figumarket
MYSQL_USER=figu
MYSQL_PASSWORD=figu
MYSQL_ROOT_PASSWORD=rootpass
```

### Comandos útiles
- Parar contenedores: 
```bash
docker compose down
```
- Reconstruir imágenes:
```bash
docker compose build
```

---

## 💻 Levantar el proyecto en local (sin Docker)

### Backend (Symfony)

```bash
cd backend
symfony server:start
```
- Se ejecutará en el puerto **8000**.

### Frontend (React + Tailwind)

```bash
cd frontend
npm install
npm run dev
```
- Se ejecutará en el puerto **5173**.

---

## 🔑 Credenciales de prueba

### Usuario normal
- Email: `bruno@example.com`
- Contraseña: `bruno123`

### Usuario administrador
- Email: `admin@example.com`
- Contraseña: `admin123`

> Estas credenciales permiten probar todas las funcionalidades del proyecto. El usuario admin puede plublicar noticias y eliminar cualquier producto de la web por los motivos que sean.

---

## 📦 Funcionalidades principales

- Publicación de figuras coleccionables con **fotos, precio y características**.
- Gestión de estado de las figuras: **disponible, vendida, seguimiento**.
- Sistema de **figuras destacadas** para aumentar la visibilidad según un sistema de tiers y tiempo.
- **Mensajería entre usuarios** para negociar compraventas.
- **Noticias y novedades** en la página principal.
- Interfaz **responsiva**, compatible con móviles y escritorio.
- Gestión de **usuarios y roles** (normal / administrador).
- Base de datos MySQL con tablas normalizadas y datos de prueba.

---

## ⚙️ Tecnologías utilizadas

 Frontend: React, Tailwind CSS 
 Backend: Symfony (PHP) 
 Base de Datos: MySQL 
 Contenedores: Docker Compose 
 Control de versiones: GitHub 

---

## 📝 Notas adicionales

- Asegúrate de tener **Docker** instalado si vas a ejecutar los contenedores.
- Para probar todo en local, utiliza los comandos indicados para frontend y backend.
- El proyecto está listo para desplegar y testear en cualquier entorno que soporte Docker.
- La estructura del proyecto está organizada en carpetas:
  - `frontend` → todo el código relacionado con React y Tailwind
  - `backend` → todo el código relacionado con Symfony y API
- La base de datos se configura automáticamente mediante docker-compose.yml y contiene datos.

---


