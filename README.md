# SRGDJ

**Sistema de Registro y Gestión de Documentos Jurídicos**

SRGDJ es una plataforma web interna para el **Instituto Nacional de Migración (INM)**, Oficina de Representación Acapulco, Guerrero, área de **Asuntos Jurídicos**. Centraliza el registro, consulta y seguimiento de documentos legales que hoy dependen de archivos físicos y conocimiento individual.

## Funcionalidades Actuales

| Área | Estado actual |
| --- | --- |
| Autenticación | Login con JWT de acceso, refresh token en cookie httpOnly, rotación de sesión, logout y `/auth/me`. |
| Seguridad | Hashing con Argon2, Helmet, CORS configurado, rate limit específico para `/auth/login`. |
| Roles y permisos | RBAC por permisos como `documents:read`, `users:read`, `catalogs:update`, `audit:read`. |
| Frontend protegido | Rutas privadas y rutas administrativas con guardas por permiso. |
| Documentos | Alta, listado, búsqueda global, filtros, paginación, ordenamiento, detalle, edición y eventos. |
| Eliminación | Soft delete para documentos. Hard delete queda protegido por `documents:remove`, no asignado en V1. |
| Catálogos | Tipos de documento, estatus y ubicaciones físicas con activación/desactivación. |
| Administración | Usuarios, roles, permisos, catálogos y auditoría. |
| Validación compartida | Esquemas Zod en `@srgdj/shared` para contratos compartidos. |

## Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| Monorepo | pnpm workspaces |
| Frontend | React 19, Vite, TypeScript |
| UI | shadcn/ui, Tailwind CSS v4, lucide-react |
| Estado cliente | Zustand para sesión, TanStack Query para server state |
| Formularios | React Hook Form + Zod |
| Backend | Express 5 + TypeScript |
| Base de datos | MySQL + Drizzle ORM |
| Testing | Vitest + Supertest |

## Estructura del Repositorio

```text
srgdj/
├── apps/
│   ├── api/
│   │   ├── drizzle/              # Migraciones Drizzle
│   │   └── src/
│   │       ├── database/         # Cliente, schema y seed
│   │       ├── middlewares/      # Auth, validación y errores
│   │       ├── modules/          # auth, documents, catalogs, users, roles, permissions, audit
│   │       ├── routes/
│   │       └── utils/
│   └── web/
│       └── src/
│           ├── app/              # Router, layouts y páginas
│           ├── config/           # Configuración de navegación
│           ├── modules/          # auth, documents, admin
│           └── shared/           # apiClient, UI, hooks, utilidades
├── packages/
│   ├── shared/                   # Zod schemas, tipos y constantes compartidas
│   └── tsconfig/                 # Configuración TS base
├── docs/
├── package.json
└── pnpm-workspace.yaml
```

## Requisitos

- Node.js 20 o superior
- pnpm 10.33.0 o compatible
- MySQL 8 o superior

## Instalación

```bash
pnpm install
pnpm build:shared
```

## Variables de Entorno

Archivo `apps/api/.env`:

```env
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/srgdj
PORT=3000
WEB_ORIGIN=http://localhost:5173
JWT_SECRET=secret-local
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=7
SESSION_INACTIVITY_MINUTES=30
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
LOGIN_RATE_LIMIT_WINDOW_MS=900000
```

Archivo `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Scripts de Raíz

| Script | Descripción |
| --- | --- |
| `pnpm dev:api` | Inicia la API con `tsx watch`. |
| `pnpm dev:web` | Inicia Vite para frontend. |
| `pnpm dev:shared` | Compila `@srgdj/shared` en watch. |
| `pnpm build:shared` | Compila `packages/shared`. |
| `pnpm build:web` | Compila frontend. |
| `pnpm build:api` | Compila API. |
| `pnpm build` | Compila shared, web y API. |
| `pnpm typecheck` | Compila shared y ejecuta typecheck en shared, web y API. |
| `pnpm lint` | Ejecuta ESLint del frontend. |
| `pnpm test` | Ejecuta `test:api`. |
| `pnpm test:api` | Ejecuta Vitest en `apps/api`. |

## Scripts por Aplicación

### API

Desde la raíz:

```bash
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api run test:integration
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:push
pnpm --filter api db:seed
pnpm --filter api db:studio
```

### Web

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web preview
```

### Shared

```bash
pnpm --filter @srgdj/shared build
pnpm --filter @srgdj/shared typecheck
pnpm --filter @srgdj/shared dev
```

## Base de Datos

```bash
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

El seed crea catálogos, permisos, roles, usuarios demo, documentos y eventos.

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin` | `Admin123*` | Administrador |
| `jefa.juridico` | `Admin123*` | Jefe / Encargado |
| `usuario.demo` | `Admin123*` | Usuario normal |

## Autenticación y Sesiones

- `POST /api/v1/auth/login` valida usuario y contraseña, crea sesión y devuelve `accessToken`.
- El refresh token se guarda en cookie `httpOnly`, `sameSite=lax`, ruta `/api/v1/auth`.
- `POST /api/v1/auth/refresh` rota access token y refresh token, actualiza hash de sesión y extiende expiración.
- `POST /api/v1/auth/logout` revoca la sesión actual y limpia la cookie.
- `GET /api/v1/auth/me` devuelve el usuario autenticado y permisos.
- Las sesiones se invalidan si están revocadas, expiradas, inactivas o si el usuario/rol fue desactivado.
- `/auth/login` tiene rate limit por cliente. Por defecto: 5 intentos cada 15 minutos.

## Roles y Permisos

Los permisos se evalúan en backend con `requirePermission`. El frontend también oculta navegación/acciones y protege rutas administrativas.

Permisos principales:

- Documentos: `documents:create`, `documents:read`, `documents:update`, `documents:delete`, `documents:events:create`.
- Hard delete: `documents:remove`, protegido y no asignado en V1.
- Catálogos: `catalogs:create`, `catalogs:read`, `catalogs:update`.
- Usuarios: `users:create`, `users:read`, `users:update`, `users:deactivate`.
- Roles: `roles:create`, `roles:read`, `roles:update`, `roles:permissions:update`.
- Permisos: `permissions:create`, `permissions:read`, `permissions:update`.
- Auditoría: `audit:read`.

## API Principal

Base path: `/api/v1`

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Estado del servicio. |
| `POST` | `/auth/login` | Login con rate limit. |
| `POST` | `/auth/refresh` | Rotación de sesión. |
| `GET` | `/auth/me` | Usuario actual. |
| `POST` | `/auth/logout` | Revoca sesión. |
| `GET` | `/documents` | Listado con `q`, filtros, paginación y ordenamiento. |
| `GET` | `/documents/:id` | Detalle con eventos. |
| `POST` | `/documents` | Alta de documento. |
| `PATCH` | `/documents/:id` | Actualización parcial. No actualiza soft-deleted. |
| `PATCH` | `/documents/delete/:id` | Soft delete. |
| `DELETE` | `/documents/remove/:id` | Hard delete, requiere `documents:remove`; no habilitado para V1 normal. |
| `GET` | `/documents/:id/events` | Eventos del documento. |
| `POST` | `/documents/:id/events` | Crea nota/cambio de estado. |
| `GET` | `/document-types` | Catálogo de tipos. |
| `GET` | `/document-statuses` | Catálogo de estados. |
| `GET` | `/physical-locations` | Catálogo de ubicaciones. |
| `GET` | `/users`, `/roles`, `/permissions`, `/audit-logs` | Administración protegida. |

## Módulo de Documentos

- El listado excluye documentos con `deletedAt`.
- La búsqueda usa `q` contra oficio, expediente, actor y demandado.
- Filtros: `documentTypeId`, `currentStatusId`, `receivedDateFrom`, `receivedDateTo`.
- Ordenamiento permitido: `officeDate`, `receivedDate`, `documentType`, `status`, `createdAt`; `sortOrder` acepta `asc` o `desc`.
- Crear documento inserta un evento `CREATED`.
- Actualizar documento inserta `UPDATED` o `STATUS_CHANGED`.
- Soft delete marca `deletedAt` y registra evento `DELETED`.
- Hard delete queda reservado para un permiso separado.

## Frontend

- `AuthBootstrap` restaura sesión usando refresh token.
- `PrivateRoute` protege rutas autenticadas.
- `PermissionRoute` protege rutas administrativas con permisos específicos.
- `apiClient` agrega Bearer token, envía cookies, reintenta con refresh en 401 y limpia sesión si falla.
- La navegación lateral oculta opciones si el usuario no tiene permiso.

## Comandos de Validación

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter api exec drizzle-kit check
```

### Pruebas de integración MySQL

Las pruebas de integración de API usan una base MySQL desechable y no se ejecutan contra `DATABASE_URL`. Para habilitarlas se debe definir `INTEGRATION_DATABASE_URL` con un usuario exclusivo de pruebas.

El usuario debe poder:

- Conectarse al servidor MySQL.
- Crear y eliminar bases de datos temporales con prefijo `srgdj_it_`.
- Crear, alterar, indexar, insertar, actualizar, borrar y consultar tablas dentro de esas bases.
- Crear llaves foráneas e índices usados por las migraciones Drizzle.

Ejemplo local:

```sql
CREATE USER 'srgdj_integration'@'localhost' IDENTIFIED BY 'password-local';
GRANT CREATE, DROP ON *.* TO 'srgdj_integration'@'localhost';
GRANT ALL PRIVILEGES ON `srgdj\_it\_%`.* TO 'srgdj_integration'@'localhost';
FLUSH PRIVILEGES;
```

Ejecución:

```bash
INTEGRATION_DATABASE_URL=mysql://srgdj_integration:password-local@localhost:3306/mysql pnpm --filter api run test:integration
```

Si `INTEGRATION_DATABASE_URL` no está definida, el comando se carga correctamente pero omite la suite de integración.

## Limitaciones V1 y Riesgos Pendientes

- `officeNumber` tiene índice único global. Un documento soft-deleted sigue reservando ese número; si se requiere reutilización tras soft delete, se necesita una estrategia MySQL-compatible.
- El rate limit de login es en memoria. En despliegues multi-instancia debe migrarse a Redis u otro store compartido.
- `documents:remove` existe como protección de hard delete, pero no se asigna en el seed ni se expone como flujo V1.
- No hay pruebas frontend automatizadas para guardas de ruta o flujos visuales.
- El build frontend aún muestra advertencia por chunk mayor a 500 kB.
- Reportes/exportaciones, notificaciones y adjuntos digitales no forman parte de V1.

## Documentación

- [`docs/00-Idea-General-SRGDJ.md`](./docs/00-Idea-General-SRGDJ.md)
- [`docs/01-Documento-Ejecutivo.md`](./docs/01-Documento-Ejecutivo.md)
- [`docs/02-Documento-Tecnico.md`](./docs/02-Documento-Tecnico.md)
- [`docs/03-Preparacion-Produccion.md`](./docs/03-Preparacion-Produccion.md)

## Licencia

Proyecto privado — uso institucional del INM.
