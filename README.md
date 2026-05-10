# Code Academy

Plataforma eCommerce de cursos y libros de programación con Django, React y Stripe.

## Estado del proyecto

El proyecto ya tiene implementados los flujos principales:

- autenticación con JWT
- catálogo de productos con filtros
- carrito persistente en backend
- órdenes y pagos con Stripe en modo test
- acceso protegido a libros y cursos
- progreso de cursos y certificados
- panel admin mejorado
- seed data reproducible
- Docker full stack para desarrollo

## Arquitectura

- Backend: Django 4.2 + DRF + PostgreSQL
- Frontend: React + TypeScript + Vite
- Auth: JWT con `djangorestframework-simplejwt`
- Pagos: Stripe (modo test)
- Infra local: Docker Compose

Si quieres la versión más completa de arquitectura, operaciones y handover, revisa:

- [docs/HANDOVER.md](docs/HANDOVER.md)

## Inicio rápido

### 1) Requisitos

- Docker Desktop
- Node.js 18+ si vas a correr frontend fuera de Docker
- Git
- Stripe CLI opcional para webhooks locales

### 2) Variables de entorno

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Completa al menos:

- `DJANGO_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET` si usas `stripe listen`

### 3) Levantar todo

```bash
docker compose up -d --build
docker compose exec web python manage.py migrate
```

### 4) URLs

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/test/
- Admin: http://localhost:8000/admin/

## Seed data

Si necesitas cargar el catálogo demo desde cero:

```bash
docker compose exec web python manage.py seed_catalog --clear
```

Este comando es idempotente y está probado.

## Flujo de prueba recomendado

1. Registrarte o iniciar sesión.
2. Explorar catálogo.
3. Agregar productos al carrito.
4. Ir al checkout y pagar con Stripe test.
5. Revisar órdenes.
6. Descargar un libro o avanzar un curso.

Tarjeta de prueba de Stripe:

- `4242 4242 4242 4242`
- fecha futura
- CVC cualquiera

## Comandos útiles

```bash
docker compose ps
docker compose logs -f web
docker compose logs -f frontend
docker compose exec web python manage.py test
docker compose exec web python manage.py test products -v2
docker compose exec web python manage.py test cart -v2
```

## Reinicio limpio

```bash
docker compose down
docker compose up -d --build
docker compose exec web python manage.py migrate
```

## Notas de entrega

- El proyecto está en la rama `main`.
- Los cambios se están versionando con commits semánticos.

# Code Academy

Plataforma eCommerce para cursos y libros de programación.

## Stack

- Backend: Django + DRF + PostgreSQL
- Frontend: React + TypeScript + Vite
- Auth: JWT
- Pagos: Stripe (test mode)
- Infra local: Docker Compose

---

## 1) Requisitos previos

Instalar:

- Docker Desktop
- Node.js 18+
- npm 9+
- Git
- (Opcional) Stripe CLI para webhooks locales

Verificar:

```bash
docker --version
docker compose version
node --version
npm --version
git --version
```

---

## 2) Clonar y abrir proyecto

```bash
git clone <URL_DEL_REPO>
cd CodeAcademy
```

Si trabajarás una rama específica:

```bash
git checkout <tu-rama>
```

---

## 3) Variables de entorno (backend)

Crear `.env` desde plantilla:

```bash
cp .env.example .env
```

Editar `.env` y completar **obligatoriamente** Stripe:

- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_PUBLISHABLE_KEY=pk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (si usarás webhook firmado)
- `STRIPE_CURRENCY=usd`

Las variables de DB/CORS ya tienen valores de desarrollo por defecto.

> Nunca subir `.env` a Git.

---

## 4) Variables de entorno (frontend)

Crear archivo de frontend:

```bash
cp frontend/.env.example frontend/.env
```

Validar que tenga:

- `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

Debe coincidir con la llave pública test del backend.

---

## 5) Levantar proyecto completo en Docker (recomendado)

Desde raíz:

```bash
docker compose up -d --build
docker compose exec web python manage.py migrate
```

Esto levanta:

- `db` (PostgreSQL)
- `web` (Django API)
- `frontend` (React + Vite)

Opcional admin:

```bash
docker compose exec web python manage.py createsuperuser
```

---

## 6) Frontend en Docker vs local

### Opción A (requisito full Docker)

No necesitas correr `npm run dev` localmente. El frontend ya corre en el servicio `frontend`.

### Opción B (solo desarrollo frontend local)

```bash
cd frontend
npm install
npm run dev
```

Si usas esta opción, asegúrate de tener backend en Docker (`web` + `db`) levantado.

---

## 7) URLs de verificación

- Frontend: http://localhost:5173
- API test: http://localhost:8000/api/test/
- Django Admin: http://localhost:8000/admin/

---

## 8) Configurar webhook de Stripe (recomendado para pruebas reales)

En otra terminal:

```bash
stripe login
stripe listen --forward-to localhost:8000/api/orders/webhook/stripe/
```

Copiar el `whsec_...` que muestra Stripe CLI y colocarlo en `.env` (`STRIPE_WEBHOOK_SECRET`).

Luego reiniciar backend:

```bash
docker compose restart web
```

---

## 9) Flujo de prueba completo (compra + acceso)

1. Registrar/login en frontend.
2. Comprar producto en checkout con tarjeta test:
   - `4242 4242 4242 4242`
   - fecha futura, CVC cualquiera.
3. Confirmar orden en “Mis Órdenes”.
4. Verificar acceso a producto comprado.
5. Libros: probar descarga protegida (máximo 3 descargas).
6. Cursos: completar capítulos, llegar a 100% y descargar certificado PDF.

---

## 10) Comandos útiles

Levantar/parar:

```bash
docker compose up -d
docker compose down
```

Logs:

```bash
docker compose logs -f web
docker compose logs -f db
```

Django (contenedor):

```bash
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
docker compose exec web python manage.py test
docker compose exec web python manage.py shell
```

Frontend:

```bash
docker compose logs -f frontend

# Opcional (si corres frontend local)
cd frontend
npm run dev
npm run build
```

---

## 11) Troubleshooting rápido

### Error: `No module named 'reportlab'`

```bash
docker compose build --no-cache web
docker compose up -d
```

### Error checkout 401 / sesión expirada

- Cerrar sesión y volver a iniciar.
- Verificar `code_academy_access_token` y `code_academy_refresh_token` en navegador.

### Stripe no inicializa en frontend

- Revisar `frontend/.env` (`VITE_STRIPE_PUBLISHABLE_KEY`).
- Si frontend corre en Docker, reiniciar servicio:

```bash
docker compose restart frontend
```

- Si frontend corre local, reiniciar `npm run dev`.

### Webhook no actualiza estado de pago

- Confirmar `stripe listen` activo.
- Confirmar `STRIPE_WEBHOOK_SECRET` correcto.
- Revisar `docker compose logs -f web`.

---

## 12) Notas para quien hace pull por primera vez

Si haces pull y hubo cambios en `requirements.txt` o `dockerfile`, reconstruye:

```bash
docker compose down
docker compose build --no-cache web
docker compose up -d
docker compose exec web python manage.py migrate
```

Si hubo cambios en frontend:

```bash
# Si frontend corre en Docker
docker compose up -d --build frontend

# Si frontend corre local
cd frontend
npm install
npm run dev
```

