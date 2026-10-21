# @lilo/auth-service

> Usuarios, sesiones, permisos y equipos. Registro/login, JWT, roles.

Puerto por defecto: `4004`

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/routes/` — `/auth/register`, `/auth/login`, `/auth/refresh`, `/teams`
- `src/middleware/` — verificación de JWT, control de permisos por rol
- `src/models/` — `users`, `teams`, `team_members`

