# Frontend - Code Academy

Este frontend depende del backend Django y de variables de entorno de Stripe.

## Setup recomendado

Seguir la guía completa del repositorio raíz:

- [README.md](../README.md)

## Quick start (solo frontend)

```bash
cp .env.example .env
npm install
npm run dev
```

## Variable obligatoria

`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

Si cambias `.env`, reinicia `npm run dev`.
