# @lilo/billing-service

> Planes freemium/pro, límites de uso (generaciones/mes) y pagos vía Stripe.

Puerto por defecto: `4006`

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/stripe/` — webhooks, checkout, suscripciones
- `src/plans/` — definición de planes y límites (free / pro)
- `src/routes/` — `/billing/checkout`, `/billing/webhook`, `/billing/usage`

