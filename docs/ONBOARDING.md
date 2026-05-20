# Code Academy - Onboarding

## Qué es este proyecto

Code Academy es una tienda en línea para cursos y libros de programación. Incluye autenticación de usuarios, catálogo de productos, gestión de carrito y órdenes, checkout con Stripe, entrega de contenido protegido y seguimiento del progreso de cursos.

## Quién debería leer esto

Usa esta guía si necesitas:

- ejecutar el proyecto localmente
- entender los flujos de negocio principales
- trabajar en características backend o frontend
- ejecutar pruebas antes de enviar cambios
- preparar el proyecto para evaluación

## Requisitos previos

Instala estas herramientas primero:

- Git
- Docker Desktop
- Node.js 18+ si quieres ejecutar el frontend fuera de Docker
- Python solo si planeas ejecutar el backend fuera del flujo del contenedor
- Stripe CLI es opcional pero útil para pruebas locales de webhooks

## Configuración inicial

### 1. Clonar y abrir el repo

```bash
git clone https://github.com/CSMJ-Coders/CodeAcademy
cd "Tienda Virtual"
```

### 2. Crear archivos de entorno

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Completa al menos:

- `DJANGO_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET` si quieres webhooks firmados

### 3. Iniciar el stack

```bash
docker compose up -d --build
```

### 4. Ejecutar migraciones

```bash
docker compose exec web python manage.py migrate
```

### 5. Datos seed opcionales

```bash
docker compose exec web python manage.py seed_catalog --clear
```

## Cómo funciona el proyecto

### Autenticación

- JWT se usa para login y llamadas API autenticadas
- usuarios pueden registrarse, iniciar sesión, refrescar tokens y cerrar sesión

### Catálogo

- productos son cursos o libros
- hay filtros disponibles por tipo, nivel, idioma, categoría, destacado y nuevo
- contenido del catálogo se gestiona desde admin de Django y datos seed

### Carrito y órdenes

- el carrito se persiste en el backend
- checkout crea una orden y un PaymentIntent de Stripe
- cuando el pago tiene éxito, la orden se marca como completada y el usuario recibe acceso

### Acceso protegido

- libros se descargan solo a través de endpoints autenticados
- límites de descarga se aplican por usuario y producto
- progreso de curso se calcula de capítulos completados
- certificados se generan como PDFs cuando el curso alcanza 100%

### Notificaciones

- notificaciones se abstraen a través de `NotificationService`
- el proyecto incluye implementaciones de correo electrónico y webhooks
- esto mantiene la capa de servicio desacoplada de un canal de entrega específico

## Flujo de trabajo típico para colaboradores

Cuando cambias código, sigue este orden:

1. entiende el propietario de la característica: vista, servicio o modelo
2. haz el cambio más pequeño que satisface la regla
3. ejecuta pruebas para la parte tocada
4. actualiza diagramas o docs si la arquitectura cambió
5. verifica el stack completo si el cambio afecta puntos de integración

## Comandos útiles

### Stack completo

```bash
docker compose up -d --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py test
```

### Pruebas dirigidas

```bash
docker compose exec web python manage.py test products -v2
docker compose exec web python manage.py test orders -v2
docker compose exec web python manage.py test cart -v2
```

### Solo frontend

```bash
cd frontend
npm install
npm run dev
```

## URLs

- Frontend: http://localhost:5173
- Endpoint de prueba API: http://localhost:8000/api/test/
- Admin: http://localhost:8000/admin/

## Solución de problemas

- Si el backend intenta alcanzar `db` fuera de Docker, usa el flujo de pruebas o fallback SQLite ya configurado en settings.
- Si los webhooks de Stripe no funcionan localmente, ejecuta `stripe listen --forward-to localhost:8000/api/orders/webhook/stripe/`.
- Si el frontend no puede alcanzar la API, verifica el proxy de Vite y el estado del contenedor de backend.

## Buenos lugares para empezar en la base de código

- `app/config/settings.py` para configuración de entorno y plataforma
- `app/orders/services.py` para reglas de negocio de órdenes
- `app/products/services.py` para progreso de cursos y certificados
- `app/notifications/` para abstracciones de entrega
- `frontend/src/app/services/api.ts` para llamadas API del frontend

## Qué ya está hecho

- backend y frontend están conectados a través de Docker
- lógica de orden y acceso está en servicios, no en vistas
- notificaciones se abstraen con una interfaz
- pruebas pasan localmente con el fallback configurado
- diagramas se han añadido para documentación de clase y arquitectura
