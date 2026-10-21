# @lilo/api-gateway

> Enrutamiento hacia los microservicios, rate limiting y middleware de autenticación compartido.

Puerto por defecto: `4000`

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/routes/` — mapeo de rutas públicas hacia cada microservicio interno
- `src/middleware/` — validación de JWT, rate limiting por plan de usuario

## Nota

En producción puede reemplazarse por Kong u otro API gateway administrado;
esta implementación en Fastify sirve como punto de entrada simple para el MVP.

