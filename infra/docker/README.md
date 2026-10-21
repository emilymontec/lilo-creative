# Docker

`Dockerfile.service` es genérico para todos los microservicios Node.js —
se parametriza con `SERVICE_PATH` (ej. `services/generation-service`).

```bash
docker build -f infra/docker/Dockerfile.service \
  --build-arg SERVICE_PATH=services/generation-service \
  -t lilo/generation-service .
```

`docker-compose.yml` (raíz del repo) levanta solo la infraestructura de
soporte en local (Postgres, Redis, RabbitMQ) — los servicios en sí se corren
con `npm run dev` durante desarrollo.
