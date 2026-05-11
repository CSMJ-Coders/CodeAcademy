# Frontend - Code Academy

Este frontend consume la API Django del repositorio raíz.

## Recomendado

Sigue la guía principal del proyecto:

- [README del repositorio](../README.md)

## Ejecutar con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d --build frontend
```

Frontend disponible en:

- http://localhost:5173

## Variables de entorno

```bash
cp .env.example .env
```

Obligatoria:

- `VITE_STRIPE_PUBLISHABLE_KEY`

## Desarrollo local

```bash
npm install
npm run dev
```

Si cambias `.env`, reinicia el servidor de Vite.
# Frontend - Code Academy

Este frontend depende del backend Django y de variables de entorno de Stripe.

## Setup recomendado

Seguir la guía completa del repositorio raíz:

- [README.md](../README.md)

## Ejecutar en Docker (requisito full stack)

Desde la raíz del proyecto:

```bash
docker compose up -d --build frontend
```

El frontend queda disponible en `http://localhost:5173`.

Logs:

```bash
docker compose logs -f frontend
```

## Quick start (solo frontend)

```bash
cp .env.example .env
npm install
npm run dev
```

## Variable obligatoria

`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

Si cambias `.env`, reinicia `npm run dev`.
