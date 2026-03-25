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
