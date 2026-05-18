#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "Waiting for postgres at ${DB_HOST}:${DB_PORT}..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 0.2
done
echo "PostgreSQL started"

# Optional: run migrations on startup
# python manage.py migrate --noinput

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

if [ "${DJANGO_SETTINGS_MODULE}" = "config.settings_production" ]; then
  exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers "${GUNICORN_WORKERS:-3}" --timeout "${GUNICORN_TIMEOUT:-120}"
fi

exec python manage.py runserver 0.0.0.0:8000
