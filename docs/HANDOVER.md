# Code Academy — Handover

Este documento resume cómo está construido el proyecto, cómo operarlo y qué queda como mejora futura.

## 1. Qué resuelve la plataforma

- Catálogo de cursos y libros
- Carrito persistente
- Checkout con Stripe en modo test
- Órdenes con historial
- Acceso protegido a libros y cursos
- Progreso y certificados
- Panel admin para operar contenido

## 2. Arquitectura técnica

### Backend

- Django 4.2 + Django REST Framework
- PostgreSQL
- JWT con `djangorestframework-simplejwt`
- Stripe para pagos de prueba
- Archivos protegidos servidos desde Django

### Frontend

- React + TypeScript + Vite
- Contexts para auth y carrito
- Consumo de API vía `fetch`
- Proxy Vite para `/api` y `/media`

### Infra local

- `compose.yml` levanta `db`, `web` y `frontend`
- Docker utilizado como entorno estándar de desarrollo

## 3. Estructura funcional por dominios

### Auth

- Registro
- Login/logout
- Perfil
- Refresh token

### Products

- Categorías
- Productos
- Capítulos / índice
- Búsqueda, filtros y destacados
- Seed data reproducible con `seed_catalog`

### Cart

- Carrito por usuario o sesión
- Fusión automática al iniciar sesión
- Persistencia en backend

### Orders

- Órdenes con `Order` y `OrderItem`
- Stripe PaymentIntent
- Historial de compras

### Access

- Descargas protegidas
- Límite de descargas
- Progreso de cursos
- Certificados PDF

### Admin

- Inlines de capítulos y TOC
- Acciones para publicar / despublicar
- Acciones masivas de órdenes
- Gestión de usuarios

## 4. Cómo levantar el proyecto

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
docker compose up -d --build
docker compose exec web python manage.py migrate
```

### Seed de catálogo

```bash
docker compose exec web python manage.py seed_catalog --clear
```

## 5. Verificaciones mínimas

- Frontend: http://localhost:5173
- Admin: http://localhost:8000/admin/
- API test: http://localhost:8000/api/test/

Pruebas útiles:

```bash
docker compose exec web python manage.py test products -v2
docker compose exec web python manage.py test cart -v2
docker compose exec web python manage.py test
```

## 6. Operación diaria

### Revisar logs

```bash
docker compose logs -f web
docker compose logs -f frontend
docker compose logs -f db
```

### Reinicio limpio

```bash
docker compose down
docker compose up -d --build
docker compose exec web python manage.py migrate
```

## 7. Stripe en local

```bash
stripe login
stripe listen --forward-to localhost:8000/api/orders/webhook/stripe/
```

Usa la tarjeta de prueba:

- `4242 4242 4242 4242`

## 8. Qué está listo para entrega

- Flujo principal funcionando
- Seed data reproducible
- Admin utilizable
- Docker completo
- Tests principales pasando

## 9. Qué falta si se quiere subir a nivel producción

- Separación formal de settings por entorno
- Gunicorn + Nginx
- CI/CD
- Observabilidad (logs/errores)
- Caching y optimización fina
