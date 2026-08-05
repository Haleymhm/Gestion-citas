# Plan de Depuración Continua — VeteriApp

> **Fecha**: 2026-07-30
> **Contexto**: continuamos el ciclo de depuración tras arreglar fechas en pets/medical-records/appointments/holidays. La causa raíz común fue el uso de `z.string().datetime()` que exige ISO 8601 completo y rechaza inputs HTML `<input type="date">`.

---

## Fase 1 — Auditoría de validaciones Zod (Prioridad Alta)

**Objetivo**: detectar cualquier esquema que aún use `.datetime()` o patrones que rechacen inputs HTML típicos.

### Tareas

1. Buscar todos los `.datetime()` restantes en `src/lib/validations.ts` y verificar que estén intencionalmente restringidos (e.g. si son obligatorios y la UI nunca envía solo fecha).
2. Revisar validaciones de query params (`validateQuery`). Actualmente `appointments/route.ts` lee `dateFrom`/`dateTo` sin validación Zod; deberían pasar por `DateInput.optional()` para evitar comportamiento de `new Date("2024-12-24")` que parsea como UTC midnight.
3. Revisar campos numéricos en formularios:
   - `weight` enviado como string (e.g. `"6.5"` → debería aceptar string numérico y transformar).
   - `petId`, `vetId`, `categoryId` desde formularios dinámicos.
4. Revisar validación de RUT chileno — buscar `rut` en endpoints y validar formato con helper consistente.

### Archivos a tocar

- `src/lib/validations.ts`
- `src/app/api/v1/appointments/route.ts`
- Cualquier endpoint que reciba `weight` numérico desde form HTML.

---

## Fase 2 — Endpoints sin validación Zod (Prioridad Alta)

**Objetivo**: asegurar que todos los POST/PUT validen body.

### Tareas

1. Listar los 43 endpoints de `/api/v1/` y comparar contra los que usan `validateBody`. Cualquiera sin validación es candidato a fallo silencioso (e.g. error 500 en lugar de 400 con mensaje claro).
2. Especialmente: `medical-records/[id]/exams`, `audit-logs`, `configuracion/branding/logo`, `configuracion/branding` (PUT).

### Archivos a tocar

- `src/app/api/v1/**/route.ts` — endpoints sin `validateBody`.
- `src/lib/validations.ts` — añadir schemas faltantes.

---

## Fase 3 — Tipos de error en runtime (Prioridad Media)

**Objetivo**: entender qué está fallando en producción/desarrollo.

### Tareas

1. Revisar `next.config.ts` — actualmente tiene `typescript.ignoreBuildErrors: true`. Eso enmascara errores reales que podrían afectar funcionalidad. Recomiendo quitarlo y resolver los errores que aparezcan.
2. Verificar logging: el logger dual (pino + winston) puede estar duplicando logs o fallando en modo dev. Probar que `logger.info` y `logger.error` se ejecutan correctamente.
3. Revisar manejo de errores en APIs — patrón `if (error instanceof Error && error.message === 'No autorizado')` es frágil. Un throw de un mensaje distinto no se captura. Centralizar el manejo con códigos de error tipados.

### Archivos a tocar

- `next.config.ts`
- `src/lib/logger.ts`
- `src/lib/api-response.ts` (crear códigos de error tipados)
- `src/app/api/v1/**/route.ts` (migrar al nuevo patrón)

---

## Fase 4 — Auditoría de seguridad (Prioridad Alta)

**Objetivo**: reducir superficie de ataque.

### Tareas

1. Validar sanitización de inputs HTML en campos como `publicNotes`, `specialCharacteristics` — actualmente son `z.string()` sin `.max()`. Riesgo de payloads enormes o XSS si se renderizan sin escape.
2. Revisar filtros SQL/Prisma — buscar `prisma.<model>.findMany({ where: { name: { contains: search } } })` para confirmar que `mode: 'insensitive'` se aplica (ya lo hace en pets, verificar en otros).
3. Verificar que el `proxy.ts` realmente bloquea rutas no listadas (regex del `config.matcher`).

### Archivos a tocar

- `src/lib/validations.ts` (añadir `.max()`).
- `src/app/api/v1/**/route.ts` (filtros Prisma).
- `src/proxy.ts` (validar matcher).

---

## Fase 5 — Calidad y cobertura de tests (Prioridad Media)

**Objetivo**: subir confianza en cambios futuros.

### Tareas

1. Tests de API routes — actualmente 0. Los 263 tests son de `lib/` y `services/`. Añadir tests de al menos los endpoints más críticos (auth, pets, appointments).
2. Tests de componentes — `@testing-library` instalado pero sin usar. Priorizar componentes con lógica (formularios, calendario, dashboard).
3. Verificar mocks de Prisma — el `setup.ts` solo mockea `user` y `auditLog`. Si una API llama `prisma.pet`, fallará. Generalizar o agregar mocks específicos por test.

### Archivos a tocar

- `src/test/integration/**/*` (nuevo)
- `src/test/unit/components/**/*` (nuevo)
- `src/test/setup.ts`

---

## Fase 6 — Limpieza de código muerto (Prioridad Baja)

**Objetivo**: reducir superficie de mantenimiento.

### Tareas

1. Componentes no usados del template: `src/components/ecommerce/`, `videos/`, `example/` — verificar imports y eliminar si están huérfanos.
2. El archivo `jsvectormap.d.ts` existe en raíz — confirmar si se usa o mover a `src/types/`.

### Archivos a tocar

- `src/components/ecommerce/**` (verificar uso)
- `src/components/videos/**` (verificar uso)
- `src/components/example/**` (verificar uso)
- `jsvectormap.d.ts` (mover a `src/types/` o eliminar)

---

## Fase 7 — Deuda técnica observada (Prioridad Media)

**Objetivo**: estabilizar la base para futuras features.

### Tareas

1. `tsconfig.json` tiene `"module": "esnext"` pero el código importa CommonJS en algunos lados — verificar coherencia.
2. Emails de Resend con placeholder — `RESEND_API_KEY="re_xxxxxxxxxxxx"` causará fallos silenciosos. Marcar como variable requerida en runtime.
3. Relaciones `@relation` sin nombres explícitos — `VetAppointments` y `ClinicSettingUpdatedBy` están nombrados, otros no. Bajo riesgo de ambigüedad.

### Archivos a tocar

- `tsconfig.json`
- `src/lib/email/index.ts` (validación de API key)
- `prisma/schema.prisma`

---

## Orden de ejecución recomendado

| Orden | Fase | Esfuerzo estimado | Impacto |
|---|---|---|---|
| 1 | Fase 1 — Validaciones Zod restantes | Bajo | Alto |
| 2 | Fase 2 — Endpoints sin validación | Bajo-Medio | Alto |
| 3 | Fase 4 — Seguridad | Medio | Alto |
| 4 | Fase 3 — Tipos de error y next.config | Medio | Medio |
| 5 | Fase 7 — Deuda técnica | Medio | Medio |
| 6 | Fase 5 — Cobertura de tests | Alto | Medio |
| 7 | Fase 6 — Limpieza | Bajo | Bajo |

---

*Plan guardado el 2026-07-30. A la espera de aprobación para comenzar ejecución.*
