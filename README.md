# SRGDJ

**Sistema de Registro y Gestión de Documentos Jurídicos**

Plataforma web interna para el **Instituto Nacional de Migración (INM)** — Oficina de Representación Acapulco, Guerrero — área de **Asuntos Jurídicos**. Centraliza el registro, consulta y seguimiento de documentos legales (oficios, amparos, demandas, solicitudes de información, etc.) que hoy se gestionan principalmente en archivos físicos.

## Problema que resuelve

- Búsqueda lenta e ineficiente de documentos ya archivados.
- Falta de trazabilidad sobre el estado y el historial de cada documento.
- Riesgo de duplicados y dependencia del conocimiento individual del personal.
- Ausencia de un registro digital estructurado y consultable.

## Funcionalidades

| Área | Descripción |
| --- | --- |
| Registro de documentos | Captura estandarizada: número de oficio, expediente, actor, demandado, tipo, fechas, anexos, ubicación física, estado y observaciones. |
| Consulta y búsqueda | Localización rápida por campos clave con filtros y paginación. |
| Seguimiento | Bitácora de eventos por documento (cambios de estado, notas, actualizaciones). |
| Control de acceso | Roles y permisos (administrador, jefe, usuario). |
| Catálogos | Tipos de documento, estados y ubicaciones físicas. |

> El proyecto está en desarrollo activo. Módulos como autenticación JWT, exportaciones y panel administrativo forman parte del roadmap definido en la documentación técnica.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express 5, TypeScript |
| Base de datos | MySQL, Drizzle ORM |
| Validación compartida | Zod (`@srgdj/shared`) |
| Monorepo | pnpm workspaces |

## Estructura del repositorio

```text
srgdj/
├── apps/
│   ├── api/          # API REST (Express)
│   └── web/          # Aplicación web (React + Vite)
├── packages/
│   ├── shared/       # Esquemas Zod, tipos y constantes compartidos
│   └── tsconfig/     # Configuración TypeScript base
├── docs/             # Documentación ejecutiva y técnica del proyecto
├── package.json
└── pnpm-workspace.yaml
```

## Requisitos previos

- [Node.js](https://nodejs.org/) 20 o superior
- [pnpm](https://pnpm.io/) 10.33.0 (gestor definido en el proyecto)
- [MySQL](https://www.mysql.com/) 8 o superior

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd srgdj

# Instalar dependencias
pnpm install

# Compilar el paquete compartido (requerido antes de ejecutar api o web)
pnpm build:shared
```

## Configuración

Crea un archivo `.env` en `apps/api/` con las variables necesarias:

```env
# Conexión a MySQL
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/srgdj

# Puerto del servidor API (opcional, por defecto 3000)
PORT=3000
```

## Base de datos

Desde el directorio `apps/api`:

```bash
# Generar migraciones a partir del esquema
pnpm db:generate

# Aplicar migraciones
pnpm db:migrate

# (Opcional) Sincronizar esquema directamente en desarrollo
pnpm db:push

# Poblar datos de prueba (catálogos, usuarios y documentos ficticios)
pnpm db:seed
```

El seed crea usuarios de demostración. Credenciales iniciales:

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin` | `Admin123*` | Administrador |
| `jefa.juridico` | `Admin123*` | Jefe / Encargado |
| `usuario.demo` | `Admin123*` | Usuario normal |

> Usa estas credenciales solo en entornos de desarrollo.

## Desarrollo

Ejecuta cada aplicación en una terminal distinta:

```bash
# API (http://localhost:3000)
pnpm dev:api

# Frontend (http://localhost:5173)
pnpm dev:web

# Recompilar @srgdj/shared en modo watch
pnpm dev:shared
```

### Scripts disponibles (raíz)

| Script | Descripción |
| --- | --- |
| `pnpm dev:api` | Inicia la API en modo desarrollo |
| `pnpm dev:web` | Inicia el frontend con Vite |
| `pnpm dev:shared` | Compila el paquete compartido en watch |
| `pnpm build` | Compila shared, web y api |
| `pnpm build:api` | Compila solo la API |
| `pnpm build:web` | Compila solo el frontend |
| `pnpm build:shared` | Compila solo el paquete compartido |

### Scripts de base de datos (`apps/api`)

| Script | Descripción |
| --- | --- |
| `pnpm db:generate` | Genera migraciones con Drizzle Kit |
| `pnpm db:migrate` | Ejecuta migraciones pendientes |
| `pnpm db:push` | Sincroniza el esquema sin migración |
| `pnpm db:studio` | Abre Drizzle Studio |
| `pnpm db:seed` | Inserta datos de prueba |

## API

Base path: `/api/v1`

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Estado del servicio |
| `GET` | `/documents` | Listado de documentos |
| `GET` | `/documents/:id` | Detalle de un documento |
| `POST` | `/documents` | Alta de documento |
| `PATCH` | `/documents/:id` | Actualización parcial |
| `PATCH` | `/documents/delete/:id` | Eliminación lógica (soft delete) |
| `DELETE` | `/documents/remove/:id` | Eliminación permanente |

## Documentación

Documentación adicional en la carpeta [`docs/`](./docs/):

- [`00-Idea-General-SRGDJ.md`](./docs/00-Idea-General-SRGDJ.md) — Contexto y propuesta inicial
- [`01-Documento-Ejecutivo.md`](./docs/01-Documento-Ejecutivo.md) — Alcance, beneficios e impacto institucional
- [`02-Documento-Tecnico.md`](./docs/02-Documento-Tecnico.md) — Arquitectura, modelo de datos, API y roadmap

## Convenciones de desarrollo

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
- **Base de datos:** `snake_case` en tablas y columnas
- **API JSON:** `camelCase`
- **TypeScript:** `camelCase` en variables y funciones; `PascalCase` en clases

## Licencia

Proyecto privado — uso institucional del INM.
