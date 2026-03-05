# 📘 Code Academy

**Plataforma Global de eCommerce de Cursos y Libros de Programación**

Aplicación web especializada en la venta de cursos digitales y eBooks técnicos de programación, desarrollada con Django + PostgreSQL + React.

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|---|---|
| Backend | Django 4.2 + Django REST Framework |
| Base de Datos | PostgreSQL 16 |
| Autenticación | JWT (Simple JWT) |
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Contenedorización | Docker + Docker Compose |

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- [Node.js](https://nodejs.org/) (v18 o superior)
- [Git](https://git-scm.com/)

Para verificar que todo está instalado:

```bash
docker --version        # Docker version 24+ 
node --version          # v18+
npm --version           # 9+
git --version           # git version 2+
```

---

## 🚀 Configuración Inicial (Primera vez)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Digital-Courses/CodeAcademy.git
cd CodeAcademy
```

### 2. Cambiar a la rama de desarrollo

```bash
git checkout develop
```

### 3. Crear el archivo de variables de entorno

```bash
cp .env.example .env
```

> ⚠️ **IMPORTANTE:** El archivo `.env` contiene contraseñas y claves secretas. **NUNCA** lo subas a Git (ya está en `.gitignore`).

Para desarrollo local, los valores por defecto del `.env.example` funcionan sin cambios.

### 4. Levantar el Backend (Django + PostgreSQL)

```bash
docker compose up -d
```

Esto levanta 2 servicios:
- **db** → PostgreSQL en el puerto `5433`
- **web** → Django en el puerto `8000`

### 5. Aplicar migraciones de base de datos

```bash
docker compose exec web python manage.py migrate
```

### 6. Crear un usuario administrador (opcional)

```bash
docker compose exec web python manage.py createsuperuser
```

### 7. Instalar dependencias del Frontend

```bash
cd frontend
npm install
```

### 8. Levantar el Frontend (React)

```bash
npm run dev
```

---

## ✅ Verificar que todo funciona

| Servicio | URL | Qué deberías ver |
|---|---|---|
| Frontend React | http://localhost:5173 | La aplicación web completa |
| API Django | http://localhost:8000/api/test/ | `{"message": "API funcionando correctamente 🚀"}` |
| Admin Django | http://localhost:8000/admin/ | Panel de administración (usa el superuser) |

---

## 📦 Comandos del Día a Día

### Levantar el proyecto

```bash
# Terminal 1 - Backend
docker compose up -d

# Terminal 2 - Frontend (desde /frontend)
npm run dev
```

### Detener el proyecto

```bash
# Backend
docker compose down

# Frontend
Ctrl + C en la terminal donde corre npm run dev
```

### Ver logs del backend

```bash
docker compose logs -f web        # Logs de Django en tiempo real
docker compose logs -f db         # Logs de PostgreSQL
```

### Comandos de Django (dentro del contenedor)

```bash
docker compose exec web python manage.py migrate              # Aplicar migraciones
docker compose exec web python manage.py makemigrations        # Generar migraciones
docker compose exec web python manage.py createsuperuser       # Crear admin
docker compose exec web python manage.py shell                 # Consola interactiva de Django
```

### Reconstruir después de cambios en requirements.txt

```bash
docker compose down
docker compose build --no-cache web
docker compose up -d
docker compose exec web python manage.py migrate
```

---

## 📁 Estructura del Proyecto

```
CodeAcademy/
├── .env.example          # Plantilla de variables de entorno
├── .gitignore            # Archivos ignorados por Git
├── compose.yml           # Docker Compose (orquesta backend + DB)
├── dockerfile            # Imagen Docker del backend
├── requirements.txt      # Dependencias Python
│
├── app/                  # 🐍 Backend Django
│   ├── manage.py         # CLI de Django
│   ├── config/           # Configuración del proyecto
│   │   ├── settings.py   # Settings principal
│   │   ├── urls.py       # Rutas raíz
│   │   ├── wsgi.py       # Entry point producción
│   │   └── asgi.py       # Entry point async
│   ├── core/             # Utilidades compartidas
│   │   ├── models.py     # TimeStampedModel (modelo base)
│   │   └── permissions.py# Permisos personalizados
│   └── users/            # App de usuarios
│       ├── models.py     # Modelo User personalizado
│       ├── views.py      # Endpoints de la API
│       └── urls.py       # Rutas de users
│
└── frontend/             # ⚛️ Frontend React
    ├── package.json      # Dependencias Node.js
    ├── vite.config.ts    # Config de Vite + proxy a Django
    ├── tsconfig.json     # Config de TypeScript
    └── src/
        ├── main.tsx      # Entry point de React
        └── app/
            ├── routes.ts       # Rutas de la aplicación
            ├── types.ts        # Tipos TypeScript
            ├── components/     # Componentes reutilizables
            ├── contexts/       # Estado global (Auth, Cart, Orders)
            ├── data/           # Datos mock (temporal)
            └── pages/          # Páginas de la aplicación
```

---

## 🌿 Git Workflow

Usamos **Git Flow** simplificado:

```
main      →  Código estable y probado (producción)
develop   →  Rama de desarrollo (integración)
feature/* →  Ramas para nuevas funcionalidades
```

### Para trabajar en una nueva feature:

```bash
# 1. Asegúrate de estar en develop actualizado
git checkout develop
git pull origin develop

# 2. Crea tu rama de feature
git checkout -b feature/nombre-de-tu-feature

# 3. Trabaja y haz commits
git add .
git commit -m "feat(modulo): descripción del cambio"

# 4. Sube tu rama
git push origin feature/nombre-de-tu-feature

# 5. Crea un Pull Request en GitHub: feature/* → develop
```

### Formato de commits (Conventional Commits):

```
feat(users): add registration endpoint       # Nueva funcionalidad
fix(cart): fix total calculation              # Corrección de bug
chore(docker): update compose healthcheck     # Tarea de mantenimiento
docs(readme): add setup instructions          # Documentación
refactor(products): simplify filter logic     # Reorganizar código
test(orders): add payment flow tests          # Agregar tests
```

---

## 🔑 Variables de Entorno

| Variable | Descripción | Valor por defecto (dev) |
|---|---|---|
| `DJANGO_SECRET_KEY` | Clave secreta de Django | `dev-secret-key-change-in-production` |
| `DJANGO_DEBUG` | Modo debug | `True` |
| `DB_NAME` | Nombre de la base de datos | `digital_store` |
| `DB_USER` | Usuario de PostgreSQL | `digital_user` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `digital_pass` |
| `DB_HOST` | Host de la base de datos | `db` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para CORS | `http://localhost:5173` |

---
