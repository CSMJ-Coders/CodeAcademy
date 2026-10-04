# Code Academy

Plataforma de comercio electrónico para vender y consumir cursos en video y libros digitales de programación. API en Django REST Framework + PostgreSQL, frontend en React + TypeScript, pagos con Stripe y despliegue en Google Cloud Run.

**Demo:** [Frontend](https://code-academy-frontend-338552219192.us-east1.run.app) · [API (catálogo en JSON)](https://code-academy-338552219192.us-east1.run.app/api/products/)
<!-- Verificar que ambos enlaces siguen activos antes de publicar. Si el servicio ya no está, cambiar esta línea por un video corto o un GIF del flujo de compra. -->

![Catálogo](https://github.com/user-attachments/assets/9be56cc8-52fe-42c4-be83-ae073ea28962)

## Funcionalidades

- Registro e inicio de sesión con **JWT** (access + refresh, logout con blacklist).
- Catálogo de cursos y eBooks con filtros y paginación.
- Carrito persistente en el backend y órdenes de compra.
- Pagos con **Stripe** en modo test: PaymentIntents + webhook firmado que confirma la orden.
- Descargas protegidas: la API verifica que el usuario pagó antes de servir el archivo y limita el número de descargas por compra.
- Contenido de vista previa gratuita (`is_preview`) para usuarios no registrados.
- Seguimiento de progreso por curso y **certificado PDF** automático al llegar al 100 %.
- Interfaz en español e inglés (i18n).
- Comando de datos de prueba idempotente: `python manage.py seed_catalog --clear`.

## Arquitectura

| Capa | Tecnología |
|---|---|
| Backend | Django 4.2, Django REST Framework, SimpleJWT, django-filter |
| Base de datos | PostgreSQL (Neon en producción) |
| Frontend | React, TypeScript, Vite |
| Pagos | Stripe |
| Infraestructura | Docker Compose (desarrollo), Docker + Nginx + Google Cloud Run (producción) |

La lógica de negocio vive en clases `Service` y las consultas complejas en `repositories.py`. Más detalle en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Calidad y CI/CD

- **36 tests** de backend con pytest (auth, catálogo, carrito, órdenes e integración de pagos). Cobertura mínima exigida: 70 %.
- **6 pruebas E2E** con Playwright sobre el stack completo levantado con Docker Compose.
- Pipeline de **GitHub Actions** en cada push y PR: tests con PostgreSQL + cobertura, lint (Black, isort, flake8), build del frontend, E2E, escaneo de seguridad con Bandit y build de la imagen Docker.

```bash
docker compose exec web pytest --cov=. --cov-report=term
```

## Inicio rápido

Requisitos: Docker Desktop y Git (Stripe CLI es opcional, para probar webhooks en local).

```bash
git clone https://github.com/CSMJ-Coders/CodeAcademy
cd CodeAcademy
cp .env.example .env              # completar DJANGO_SECRET_KEY y las llaves test de Stripe
cp frontend/.env.example frontend/.env
docker compose up -d --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py seed_catalog --clear
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000/api/ |
| Admin | http://localhost:8000/admin/ |

Tarjeta de prueba de Stripe: `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

Guía completa de instalación, webhooks y solución de problemas: [docs/ONBOARDING.md](docs/ONBOARDING.md).

## Equipo

Proyecto académico, Universidad EAFIT (2026-1).

- **Camilo Álvarez Villegas**: desarrollador principal (autenticación JWT, pagos con Stripe, descargas protegidas y certificados, infraestructura Docker, CI/CD y despliegue).
- Matías Monsalve Ruiz
- Samuel Calderón Duque
- Juan José Díaz Rodríguez

Documentación del curso, diagramas y capturas: [Wiki](https://github.com/CSMJ-Coders/CodeAcademy/wiki).
