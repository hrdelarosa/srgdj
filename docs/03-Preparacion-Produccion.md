# Preparacion para Produccion

**Sistema:** SRGDJ  
**Uso previsto:** despliegue interno institucional  
**Alcance:** API, frontend, MySQL, pruebas, operacion y recuperacion

Este documento es una guia practica para preparar un despliegue controlado de SRGDJ en un entorno interno gubernamental. No reemplaza politicas institucionales de infraestructura, seguridad, respaldos o continuidad operativa.

---

## 1. Checklist de Despliegue

Antes de publicar una version en staging, piloto o produccion:

- Confirmar que la rama/cambio a desplegar esta identificado por commit o etiqueta.
- Ejecutar y conservar evidencia de:

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

- Ejecutar migraciones en una copia o entorno de staging antes de produccion.
- Validar que `DATABASE_URL` apunte a la base correcta del entorno.
- Validar que `WEB_ORIGIN` coincide con el dominio real del frontend.
- Validar que `VITE_API_URL` apunta a la URL publica interna de la API.
- Confirmar que `JWT_SECRET` es fuerte, privado y distinto por entorno.
- Confirmar que HTTPS/TLS esta activo en el proxy o servidor frontal.
- Confirmar que el frontend se sirve como build estatico.
- Confirmar que la API compilada inicia con `pnpm --filter api start`.
- Confirmar que `/api/v1/health` responde correctamente.
- Confirmar login, refresh, logout, listado de documentos y permisos de administracion con usuarios reales de prueba.
- Confirmar que existe respaldo reciente antes de aplicar migraciones.
- Confirmar que existe un plan de rollback.
- Confirmar responsables de soporte, base de datos, infraestructura y aplicacion.

---

## 2. Variables de Entorno Requeridas

### API (`apps/api`)

| Variable | Requerida | Ejemplo | Uso |
| --- | --- | --- | --- |
| `DATABASE_URL` | Si | `mysql://user:pass@host:3306/srgdj` | Conexion MySQL usada por Drizzle y la API. |
| `JWT_SECRET` | Si | valor aleatorio largo | Firma de access tokens JWT. Debe ser secreto y estable mientras existan sesiones. |
| `WEB_ORIGIN` | Si en produccion | `https://srgdj.interno.gob.mx` | Origen permitido para CORS. |
| `PORT` | No | `3000` | Puerto de la API si el runtime lo usa. |
| `JWT_EXPIRES_IN` | No | `15m` | Duracion del access token. |
| `REFRESH_TOKEN_DAYS` | No | `7` | Duracion del refresh token. |
| `SESSION_INACTIVITY_MINUTES` | No | `30` | Minutos maximos sin actividad antes de invalidar sesion. |
| `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` | No | `5` | Intentos maximos por ventana para `/auth/login`. |
| `LOGIN_RATE_LIMIT_WINDOW_MS` | No | `900000` | Ventana del rate limit de login en milisegundos. |

### Web (`apps/web`)

| Variable | Requerida | Ejemplo | Uso |
| --- | --- | --- | --- |
| `VITE_API_URL` | Si | `https://api-srgdj.interno.gob.mx/api/v1` | URL base consumida por el frontend. |

### Pruebas de integracion

| Variable | Requerida | Ejemplo | Uso |
| --- | --- | --- | --- |
| `INTEGRATION_DATABASE_URL` | Solo para integracion | `mysql://srgdj_integration:pass@localhost:3306/mysql` | Usuario con permisos para crear y eliminar bases desechables `srgdj_it_*`. |

Buenas practicas:

- No reutilizar secretos entre desarrollo, staging y produccion.
- No guardar `.env` productivo en Git.
- Rotar `JWT_SECRET` solo con ventana de mantenimiento, porque invalida tokens existentes.
- Usar cuentas MySQL distintas para aplicacion, migraciones, respaldos e integracion.

---

## 3. Requisitos MySQL de Produccion

Version recomendada:

- MySQL 8 o superior.
- Charset `utf8mb4`.
- Collation compatible con busqueda y acentos institucionales, por ejemplo `utf8mb4_unicode_ci`.

Cuenta de aplicacion:

- Debe tener permisos minimos sobre la base de SRGDJ:
  - `SELECT`
  - `INSERT`
  - `UPDATE`
  - `DELETE`
- No debe tener permisos globales de administracion.
- No debe tener permisos de `DROP DATABASE`.

Cuenta de migraciones:

- Debe usarse solo durante despliegues controlados.
- Debe poder ejecutar cambios de schema:
  - `CREATE`
  - `ALTER`
  - `INDEX`
  - `REFERENCES`
  - `DROP` solo si una migracion aprobada lo requiere.

Cuenta de respaldo:

- Debe poder leer tablas y bloquear/coordinar dumps segun la estrategia aprobada:
  - `SELECT`
  - `LOCK TABLES` si se usa `mysqldump` sin opciones transaccionales.
  - `SHOW VIEW` si se agregan vistas en el futuro.

Requisitos operativos:

- Respaldos automaticos verificados.
- Monitoreo de espacio en disco.
- Monitoreo de conexiones activas.
- Registro de errores MySQL.
- Plan de restauracion probado.
- Zona horaria documentada y consistente entre servidor de aplicacion, MySQL y respaldos.

---

## 4. Setup de Pruebas de Integracion MySQL

La suite de integracion no usa `DATABASE_URL`. Usa `INTEGRATION_DATABASE_URL` para crear una base temporal `srgdj_it_<suffix>`, aplicar migraciones, ejecutar flujos reales y eliminar la base al terminar.

Crear usuario local/CI de integracion:

```sql
CREATE USER 'srgdj_integration'@'localhost' IDENTIFIED BY 'password-local';
GRANT CREATE, DROP ON *.* TO 'srgdj_integration'@'localhost';
GRANT ALL PRIVILEGES ON `srgdj\_it\_%`.* TO 'srgdj_integration'@'localhost';
FLUSH PRIVILEGES;
```

Ejecutar:

```bash
INTEGRATION_DATABASE_URL=mysql://srgdj_integration:password-local@localhost:3306/mysql pnpm --filter api run test:integration
```

En CI se recomienda:

- Levantar un servicio MySQL dedicado para pruebas.
- Crear el usuario de integracion durante el job.
- Ejecutar `pnpm --filter api run test:integration` despues de `pnpm test`.
- Destruir el servicio MySQL al finalizar el job.

Si `INTEGRATION_DATABASE_URL` no esta definida, la suite se omite para no romper pruebas locales rapidas.

---

## 5. Procedimiento de Backup

Frecuencia sugerida para piloto interno:

- Backup completo diario.
- Backup antes de cada migracion.
- Retencion minima segun politica institucional.
- Copia fuera del servidor principal.

Ejemplo con `mysqldump`:

```bash
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --set-gtid-purged=OFF \
  -h <host> \
  -u <backup_user> \
  -p \
  srgdj > backups/srgdj_YYYY-MM-DD_HHMM.sql
```

Validaciones obligatorias:

- Confirmar que el archivo fue creado.
- Confirmar tamano mayor a cero.
- Guardar checksum.
- Probar restauracion en staging periodicamente.
- Registrar fecha, responsable y ubicacion del respaldo.

Ejemplo de checksum:

```bash
sha256sum backups/srgdj_YYYY-MM-DD_HHMM.sql > backups/srgdj_YYYY-MM-DD_HHMM.sql.sha256
```

---

## 6. Procedimiento de Restore

Restaurar siempre primero en un entorno no productivo, salvo incidente critico autorizado.

Pasos recomendados:

1. Detener escrituras de la aplicacion o poner la API en mantenimiento.
2. Crear una base nueva de restauracion.
3. Importar el respaldo.
4. Ejecutar validaciones minimas.
5. Cambiar `DATABASE_URL` solo despues de validar.
6. Reiniciar API.
7. Validar login, documentos, catalogos y auditoria.

Ejemplo:

```bash
mysql -h <host> -u <admin_user> -p -e "CREATE DATABASE srgdj_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -h <host> -u <restore_user> -p srgdj_restore < backups/srgdj_YYYY-MM-DD_HHMM.sql
```

Validaciones posteriores:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM document_events;
SELECT COUNT(*) FROM audit_logs;
```

Validaciones funcionales:

- Login con usuario administrativo de prueba.
- Consulta de documentos.
- Consulta de eventos de un documento.
- Consulta de catalogos.
- Consulta de auditoria.

---

## 7. Procedimiento de Migraciones

Antes de migrar:

- Confirmar backup reciente.
- Confirmar commit/version a desplegar.
- Ejecutar pruebas:

```bash
pnpm typecheck
pnpm test
pnpm build
```

- Ejecutar migracion en staging.
- Validar que staging inicia y que los flujos criticos funcionan.

En produccion:

```bash
pnpm --filter api db:migrate
```

Despues de migrar:

- Reiniciar API si aplica.
- Validar `/api/v1/health`.
- Validar login.
- Validar listado y creacion de documento de prueba si el protocolo lo permite.
- Revisar logs de API y MySQL.
- Registrar hora, responsable, version y resultado.

No usar `db:push` en produccion. `db:push` queda reservado para desarrollo porque sincroniza schema sin el mismo control historico que migraciones.

---

## 8. Consideraciones de Rollback

Rollback de aplicacion:

- Mantener artefacto/build anterior disponible.
- Mantener variables de entorno anteriores documentadas.
- Si no hubo migracion irreversible, volver al build anterior y reiniciar servicios.

Rollback de base de datos:

- Drizzle no genera automaticamente migraciones inversas seguras.
- Si una migracion cambia datos o elimina columnas/tablas, el rollback real puede requerir restaurar backup.
- Toda migracion destructiva debe tener:
  - aprobacion previa
  - backup verificado
  - plan de restauracion
  - ventana de mantenimiento

Regla practica:

- Cambios solo aditivos suelen permitir rollback de aplicacion.
- Cambios destructivos o transformaciones de datos requieren plan de base de datos.

---

## 9. Health Checks

Endpoint disponible:

```text
GET /api/v1/health
```

Uso recomendado:

- Load balancer o proxy: verificar que la API responde.
- Monitoreo: revisar latencia y codigos distintos de 2xx.
- Despliegue: validar despues de iniciar o reiniciar la API.

Limitacion actual:

- El health check confirma disponibilidad HTTP, pero no valida conexion real a MySQL.

Mejora recomendada antes de produccion completa:

- Agregar un readiness check que confirme conexion MySQL con una consulta ligera.
- Separar `health` basico de `ready` operativo si se usa orquestador.

---

## 10. Riesgos Operativos

| Riesgo | Impacto | Mitigacion recomendada |
| --- | --- | --- |
| Rate limit de login en memoria | En multiples instancias no comparte estado. | Migrar a Redis u otro store compartido. |
| `officeNumber` unico con soft delete | Un documento eliminado logicamente sigue reservando numero. | Definir regla institucional antes de permitir reutilizacion. |
| Sin pruebas frontend automatizadas | Guardas visuales y flujos UI pueden romperse sin alerta. | Agregar pruebas frontend y E2E. |
| Integracion MySQL no obligatoria en CI | Errores reales de DB pueden detectarse tarde. | Ejecutar MySQL integration tests en CI. |
| Health check sin DB | API puede responder aunque MySQL falle. | Agregar readiness check con DB. |
| Rollback DB no automatizado | Migraciones destructivas pueden requerir restauracion. | Usar migraciones aditivas y backups verificados. |
| Auditoria basica | Puede faltar metadata para investigaciones. | Enriquecer IP, user-agent, entidad y contexto por accion. |
| Chunk frontend grande | Carga inicial mas lenta. | Aplicar code splitting en frontend. |

---

## 11. Checklist de Staging/Piloto

Usar este checklist antes de habilitar usuarios reales en un piloto controlado:

### Infraestructura

- [ ] Dominio interno definido.
- [ ] HTTPS/TLS activo.
- [ ] API accesible solo desde red/segmento autorizado.
- [ ] MySQL con usuario de aplicacion de permisos minimos.
- [ ] Backups automaticos activos.
- [ ] Restore probado al menos una vez en staging.

### Configuracion

- [ ] `DATABASE_URL` apunta a base correcta.
- [ ] `WEB_ORIGIN` coincide con frontend.
- [ ] `VITE_API_URL` coincide con API.
- [ ] `JWT_SECRET` fuerte y privado.
- [ ] Duraciones de sesion aprobadas.
- [ ] Rate limit configurado.

### Validacion tecnica

- [ ] `pnpm typecheck` exitoso.
- [ ] `pnpm test` exitoso.
- [ ] `pnpm build` exitoso.
- [ ] Migraciones ejecutadas en staging.
- [ ] Integracion MySQL ejecutada con `INTEGRATION_DATABASE_URL`.
- [ ] `/api/v1/health` responde.

### Validacion funcional

- [ ] Login exitoso.
- [ ] Login invalido rechazado.
- [ ] Refresh y logout funcionan.
- [ ] Usuario sin permiso recibe 403.
- [ ] Alta de documento funciona.
- [ ] Listado, busqueda, filtros, ordenamiento y paginacion funcionan.
- [ ] Soft delete excluye documento de listados/detalle.
- [ ] Catálogos funcionan.
- [ ] Auditoria registra acciones criticas.

### Operacion

- [ ] Responsable tecnico asignado.
- [ ] Responsable de base de datos asignado.
- [ ] Procedimiento de soporte definido.
- [ ] Procedimiento de respaldo documentado.
- [ ] Procedimiento de restauracion documentado.
- [ ] Ventana de mantenimiento definida para migraciones.

---

## 12. Criterio de Salida a Produccion Completa

SRGDJ puede considerarse listo para produccion completa cuando:

- La suite de integracion MySQL corre en CI.
- Existe readiness check con MySQL.
- Backups y restores han sido probados.
- Existe runbook de incidentes.
- Se definio politica institucional para `officeNumber` y soft delete.
- Se definio politica de retencion de auditoria.
- El rate limit es compartido si hay multiples instancias.
- Staging/piloto no reporta fallas bloqueantes en flujos criticos.
