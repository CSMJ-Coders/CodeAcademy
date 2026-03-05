"""
Code Academy - Django Settings
==============================
Este archivo configura TODO el comportamiento de Django.
Las variables sensibles se leen del archivo .env (nunca hardcodeadas).
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# ============================================
# Cargar variables de entorno desde .env
# ============================================
# load_dotenv() busca el archivo .env en el directorio raíz del proyecto
# y carga las variables para que os.environ.get() las encuentre.
# Así separamos los SECRETOS del CÓDIGO.
load_dotenv(os.path.join(Path(__file__).resolve().parent.parent.parent, '.env'))

# BASE_DIR = la carpeta raíz de la app Django (donde está manage.py)
BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================
# Seguridad
# ============================================
# SECRET_KEY: Django la usa para firmar cookies, tokens, etc.
# Si alguien la obtiene, puede falsificar sesiones de usuario.
# Por eso NUNCA la escribimos directo en el código.
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'fallback-dev-key')

# DEBUG=True muestra errores detallados en el navegador.
# En PRODUCCIÓN debe ser False (nunca mostrar errores internos al usuario).
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1', 'yes')

# ALLOWED_HOSTS: qué dominios pueden acceder a Django.
# En desarrollo: localhost. En producción: tu-dominio.com
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# ============================================
# Aplicaciones Instaladas
# ============================================
# Django funciona con "apps" (módulos). Cada app hace una cosa.
# Las primeras 6 son de Django. Las demás son nuestras o de terceros.
INSTALLED_APPS = [
    # --- Apps de Django (vienen incluidas) ---
    'django.contrib.admin',          # Panel de administración
    'django.contrib.auth',           # Sistema de autenticación (login, permisos)
    'django.contrib.contenttypes',   # Framework de tipos de contenido
    'django.contrib.sessions',       # Manejo de sesiones de usuario
    'django.contrib.messages',       # Mensajes flash (notificaciones)
    'django.contrib.staticfiles',    # Archivos estáticos (CSS, JS, imágenes)

    # --- Apps de Terceros ---
    'rest_framework',                # Django REST Framework: para crear APIs
    'corsheaders',                   # CORS: permite que React hable con Django
    'rest_framework_simplejwt',      # JWT: autenticación con tokens

    # --- Nuestras Apps ---
    'core',                          # Utilidades compartidas (base models, permisos)
    'users',                         # Gestión de usuarios
]


# ============================================
# Middleware
# ============================================
# Middleware = "capas" que procesan CADA petición HTTP.
# Imagina una cebolla: cada petición pasa por todas las capas
# antes de llegar a tu View, y la respuesta pasa por todas al salir.
#
# IMPORTANTE: corsheaders DEBE ir lo más arriba posible
# para que procese los headers CORS antes que cualquier otra cosa.
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',            # ← CORS primero
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# ============================================
# Base de Datos
# ============================================
# Usamos PostgreSQL (base de datos profesional).
# Todas las credenciales vienen del .env
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'digital_store'),
        'USER': os.environ.get('DB_USER', 'digital_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'digital_pass'),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}


# ============================================
# Validación de Contraseñas
# ============================================
# Django valida automáticamente que las contraseñas sean seguras.
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ============================================
# Internacionalización
# ============================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True      # Soporte para traducciones
USE_TZ = True        # Usar timezone-aware datetimes


# ============================================
# Archivos Estáticos (CSS, JS, imágenes del sitio)
# ============================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'


# ============================================
# Archivos Media (subidos por usuarios/admin)
# ============================================
# MEDIA_ROOT: carpeta FÍSICA donde se guardan los archivos subidos
#   Ejemplo: los PDFs de libros, las imágenes de productos
# MEDIA_URL: la URL para acceder a esos archivos desde el navegador
#
# IMPORTANTE: En producción, los archivos de libros NO se servirán
# por URL directa. Se servirán a través de Django verificando permisos.
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# ============================================
# Modelo de Usuario Personalizado
# ============================================
# Le decimos a Django: "no uses el User por defecto,
# usa NUESTRO modelo User de la app 'users'"
AUTH_USER_MODEL = 'users.User'


# ============================================
# Django REST Framework
# ============================================
# Configuración global de la API.
REST_FRAMEWORK = {
    # Autenticación: usamos JWT (tokens) como método principal
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # Permisos: por defecto, cualquiera puede acceder (AllowAny).
    # En cada View podemos restringir individualmente.
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    # Paginación: máximo 20 resultados por página
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


# ============================================
# JWT (JSON Web Tokens)
# ============================================
# Configuración de los tokens de autenticación.
# ACCESS token: dura poco (60 min) → el usuario lo usa para cada petición.
# REFRESH token: dura más (7 días) → sirve para obtener un nuevo ACCESS token
#   sin tener que hacer login de nuevo.
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,         # Cada vez que se refresca, se da un nuevo refresh token
    'BLACKLIST_AFTER_ROTATION': True,       # El refresh token viejo se invalida
    'AUTH_HEADER_TYPES': ('Bearer',),       # El frontend envía: "Authorization: Bearer <token>"
}


# ============================================
# CORS (Cross-Origin Resource Sharing)
# ============================================
# El navegador BLOQUEA peticiones de un dominio a otro por seguridad.
# React corre en localhost:5173, Django en localhost:8000.
# Son dominios DIFERENTES → el navegador bloquea.
# CORS le dice al navegador: "está bien, este origen está permitido".
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')

# Permitir que el frontend envíe cookies/tokens en las peticiones
CORS_ALLOW_CREDENTIALS = True


# ============================================
# Default Primary Key
# ============================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'