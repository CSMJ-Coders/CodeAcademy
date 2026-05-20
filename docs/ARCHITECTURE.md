# Code Academy - Arquitectura

## Propósito

Code Academy es una plataforma eCommerce para cursos y libros de programación. El proyecto combina una API Django REST, un frontend React + Vite, pagos con Stripe, acceso protegido a contenido digital y seguimiento de progreso de cursos.

## Alcance del negocio

La plataforma cubre los flujos principales requeridos:

- registro de usuarios, inicio y cierre de sesión, gestión de perfil
- exploración de catálogo de productos con filtros y búsqueda
- persistencia del carrito en backend
- creación de órdenes y confirmación de pago con Stripe
- descargas protegidas de libros
- seguimiento de progreso de cursos y generación de certificados
- flujos de administración para catálogo y órdenes

## Stack técnico

### Backend

- Django 4.2
- Django REST Framework
- PostgreSQL en Docker para desarrollo local
- SQLite como fallback para pruebas locales fuera de Docker
- Autenticación JWT con `djangorestframework-simplejwt`
- Django Filter para filtrado de catálogo
- Integración Stripe para checkout y webhooks
- ReportLab para certificados PDF

### Frontend

- React
- TypeScript
- Vite
- Estado basado en Context para auth, carrito y órdenes
- Consumo de API mediante `fetch`

### Infraestructura y herramientas

- Docker Compose para el stack completo
- Stripe CLI para pruebas de webhooks locales
- Soporte multiidioma para Español e Inglés
- Diagramas Mermaid y exportaciones draw.io para documentación

## Visión general de la arquitectura

El sistema sigue una estructura de capas estilo MVT en el backend:

### Capa de presentación

Ubicada principalmente en `app/*/views.py`, `app/*/urls.py` y serializadores.

Responsabilidades:

- recibir solicitudes HTTP
- validar entrada a través de serializadores
- delegar acciones de negocio a servicios
- devolver respuestas API

### Capa de servicios

Ubicada en `app/orders/services.py`, `app/products/services.py` y `app/notifications/`.

Responsabilidades:

- encapsular reglas de negocio fuera de vistas
- marcar órdenes como completadas o fallidas
- otorgar acceso a productos a usuarios
- calcular progreso de cursos
- generar certificados de cursos
- enviar notificaciones a través de canales abstraídos

### Capa de dominio

Ubicada principalmente en `app/users/models.py`, `app/orders/models.py` y `app/products/models.py`.

Entidades principales:

- `User`
- `Product`
- `Category`
- `Chapter`
- `TableOfContentsEntry`
- `Order`
- `OrderItem`
- `BookDownload`
- `CourseProgress`
- `CourseCertificate`

### Capa de persistencia

- Django ORM almacena datos estructurados en PostgreSQL o SQLite
- archivos media se almacenan bajo `media/books/` y `media/certificates/`
- descargas protegidas se sirven a través de endpoints Django, no como archivos estáticos públicos

## Dependencias principales entre capas

- `views.py` llama servicios, no métodos de modelo directamente para acciones de negocio
- servicios actualizan modelos de dominio y gestionan transacciones donde sea necesario
- modelos permanecen responsables de persistencia y validación
- la abstracción de notificaciones usa DIP a través de `NotificationService`

## Reglas de negocio

Las reglas más importantes implementadas en el proyecto son:

- solo usuarios autenticados pueden comprar, descargar o seguimiento de contenido
- una orden completada otorga acceso a productos comprados
- descargas de libros se limitan por política por usuario
- progreso de cursos se deriva de capítulos completados
- certificados se generan cuando un curso alcanza 100%
- contenido de catálogo se puede filtrar por tipo, nivel, idioma, categoría y banderas destacado/nuevo

## Integraciones externas

- Stripe maneja creación de PaymentIntent y confirmación de webhooks
- proveedores SMTP o servicios de correo se pueden conectar a través de la abstracción de notificaciones
- almacenamiento de media se separa de la base de datos estructurada

## Notas de pruebas

El proyecto incluye pruebas automatizadas para:

- reglas de autenticación y propiedad
- flujos de creación de órdenes y pagos
- desbloqueo de acceso después de la compra
- escenarios de progreso de cursos y certificados
- filtrado de catálogo y descargas protegidas

Para hacer posible las pruebas locales fuera de Docker, el backend usa SQLite como fallback durante la ejecución de pruebas cuando PostgreSQL no está disponible.
