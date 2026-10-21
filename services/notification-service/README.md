# @lilo/notification-service

> Emails transaccionales y notificaciones in-app (ej. comentarios nuevos, bienvenida, límites de uso alcanzados).

Puerto por defecto: `4007`

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/email/` — envío vía proveedor (SES/Resend/Postmark)
- `src/templates/` — plantillas de email (bienvenida, comentario nuevo, límite alcanzado)
- `src/routes/` — `/notifications/send` (uso interno, llamado por otros servicios)

