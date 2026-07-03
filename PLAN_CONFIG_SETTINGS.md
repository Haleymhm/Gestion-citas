# Plan de Implementación: Módulo 8.4 — Configuración del Sistema

> **Rama:** `feature/config-settings`
> **Creada desde:** `develop`
> **Fecha:** 2026-07-03

## 🎯 Resumen ejecutivo

Implementar **3 sub-módulos independientes** que comparten un único modelo `ClinicSetting`:

1. **Horarios de atención** (bloquea a clientes en portal)
2. **Días feriados** (bloquea a clientes en portal)
3. **Personalización de marca** (solo PDFs y emails)

Exposición: nueva página UI `/configuracion` (solo ADMIN), con tabs. La marca se aplica vía inyecciones en PDFs y templates de emails.

## 📦 Modelo de datos (Prisma)

```
model ClinicSetting {
  id          String   @id @default(uuid())
  key         String   @unique    // "schedule", "branding"
  value       Json
  updatedAt   DateTime @updatedAt
  updatedById Int?
  updatedBy   User?     @relation(...)
}

model ClinicHoliday {
  id        Int      @id @default(autoincrement())
  date      DateTime @unique
  label     String
  createdById Int
  createdBy   User @relation(...)
  createdAt DateTime @default(now())
}
```

**Estructura JSON por key:**
- `schedule`: `{ monday: { open: "09:00", close: "19:00", enabled: true }, ..., sunday: { enabled: false } }`
- `branding`: `{ clinicName: "VeteriApp", logoUrl: "/uploads/logo-xxx.png", primaryColor: "#2563eb", secondaryColor: "#64748b", footerText: "VeteriApp - Gestión Integral Veterinaria", fromEmail: "noreply@vetriapp.cl" }`

## 🔌 API Routes (8 nuevas)

| Endpoint | Método | Auth | Función |
|---|---|---|---|
| `/api/v1/configuracion` | `GET` | ADMIN | Devuelve `{ schedule, holidays, branding }` consolidado |
| `/api/v1/configuracion/schedule` | `PUT` | ADMIN | Actualiza horario semanal |
| `/api/v1/configuracion/holidays` | `GET/POST` | ADMIN | Lista / crea feriados |
| `/api/v1/configuracion/holidays/[id]` | `DELETE` | ADMIN | Elimina feriado |
| `/api/v1/configuracion/branding` | `PUT` | ADMIN | Actualiza nombre, color, footer, email from |
| `/api/v1/configuracion/branding/logo` | `POST` | ADMIN | Sube archivo (multipart/form-data) a `public/uploads/` |
| `/api/v1/public/settings` | `GET` | **Público** | Solo datos para validaciones de agendamiento |

## 🔧 Servicios (lógica reusable)

`src/services/settings/`:
- `get-schedule.ts` — async getter con defaults
- `get-holidays.ts` — lista feriados próximos
- `get-branding.ts` — getter con defaults
- `validate-appointment-time.ts` — función clave: `{ allowed: boolean, reason?: 'closed_day'|'outside_hours'|'holiday' }`

## 🛡️ Integración con agendamiento

- `POST /api/v1/appointments` valida con `validateAppointmentTime()` solo si `user.role === 'CLIENT'`
- UI `agendar-citas` hace fetch a `/api/v1/public/settings` para feedback inmediato

## 🎨 Personalización de marca

**Emails** (`src/lib/email/`):
- `index.ts` usa `getBranding()` para fromEmail, clinicName
- `base.layout.tsx` y 5 templates aceptan `branding` prop

**PDFs** (`src/lib/medical-history-pdf.ts` y `audit-pdf.ts`):
- Aceptan `branding` por parámetro
- Usan `branding.primaryColor` reemplazando `RGB(41,98,255)`
- Incluyen logo centrado en header
- Footer usa `branding.footerText`

**Helper:** `src/lib/pdf/image-from-url.ts` descarga URL → base64

## 🖼️ Upload de logo

`POST /api/v1/configuracion/branding/logo`:
- multipart/form-data
- Valida mimetype (png/jpg/svg) y tamaño (2MB)
- Escribe en `public/uploads/logo-{timestamp}.{ext}`
- Actualiza `branding.logoUrl` en BD

## 🧱 UI — `/configuracion`

`src/app/(admin)/(others-pages)/configuracion/page.tsx` con componentes:
- `ConfigTabs.tsx` (tabs principal)
- `ScheduleEditor.tsx` (tabla editable por día)
- `HolidaysEditor.tsx` (lista + modal agregar)
- `BrandingEditor.tsx` (logo + color + footer + email)
- `LogoUploader.tsx` (preview + upload)

`proxy.ts`: agregar `/configuracion` a `ADMIN_ONLY_PATHS`.

## 📁 Estructura de archivos

```
prisma/
  schema.prisma                                            [MODIFICADO]
  migrations/<ts>_<name>/migration.sql                     [NUEVA]

src/
  app/api/v1/
    public/settings/route.ts                               [NUEVO]
    configuracion/route.ts                                 [NUEVO]
    configuracion/schedule/route.ts                        [NUEVO]
    configuracion/holidays/route.ts                        [NUEVO]
    configuracion/holidays/[id]/route.ts                   [NUEVO]
    configuracion/branding/route.ts                        [NUEVO]
    configuracion/branding/logo/route.ts                   [NUEVO]
    appointments/route.ts                                  [MODIFICADO]
  app/(admin)/(others-pages)/
    configuracion/page.tsx                                 [NUEVO]
  components/configuracion/
    ConfigTabs.tsx                                         [NUEVO]
    ScheduleEditor.tsx                                     [NUEVO]
    HolidaysEditor.tsx                                     [NUEVO]
    BrandingEditor.tsx                                     [NUEVO]
    LogoUploader.tsx                                       [NUEVO]
  lib/
    validations.ts                                         [MODIFICADO]
    email/
      index.ts                                             [MODIFICADO]
      templates/base.layout.tsx                            [MODIFICADO]
      templates/appointment-{created,confirmed,cancelled,completed}.tsx [MODIFICADO]
      templates/password-reset.tsx                         [MODIFICADO]
    pdf/
      image-from-url.ts                                    [NUEVO]
    medical-history-pdf.ts                                 [MODIFICADO]
    audit-pdf.ts                                           [MODIFICADO]
    proxy.ts                                               [MODIFICADO]
  services/settings/
    get-schedule.ts                                        [NUEVO]
    get-holidays.ts                                        [NUEVO]
    get-branding.ts                                        [NUEVO]
    validate-appointment-time.ts                           [NUEVO]

public/uploads/                                            [NUEVO DIR]
```

## 📝 Plan de ejecución

### Fase 1 — Modelo de datos + migraciones
1. Agregar `ClinicSetting` y `ClinicHoliday` a `schema.prisma`
2. Aplicar migración (vía SQL script + generar archivo de migración)
3. Generar cliente Prisma

### Fase 2 — Validaciones + APIs
4. Agregar schemas Zod
5. Crear `services/settings/*.ts` con defaults
6. Crear `/api/v1/public/settings`
7. Crear `/api/v1/configuracion/*` con auth ADMIN + auditoría

### Fase 3 — Integración con agendamiento
8. Modificar `POST /api/v1/appointments`
9. Modificar UI de `agendar-citas`

### Fase 4 — Personalización de marca (PDFs)
10. Crear `src/lib/pdf/image-from-url.ts`
11. Refactor `medical-history-pdf.ts` y `audit-pdf.ts`

### Fase 5 — Personalización de marca (Emails)
12. Refactor `base.layout.tsx` y 5 templates
13. Refactor `src/lib/email/index.ts`

### Fase 6 — UI Configuración
14. Modificar `proxy.ts`
15. Crear página `/configuracion` con tabs
16. Crear componentes: `ScheduleEditor`, `HolidaysEditor`, `BrandingEditor`, `LogoUploader`

### Fase 7 — Upload de logo
17. Crear endpoint `POST /api/v1/configuracion/branding/logo`
18. Crear `public/uploads/.gitkeep`

### Fase 8 — Verificación
19. `next build`
20. `npx eslint`
21. `npx jest`

## ⚠️ Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Filesystem efímero de Vercel | Documentar; interface lista para storage real (8.3) |
| Sobrecargar BD con feriados antiguos | Solo traer `WHERE date >= NOW()` |
| SVG con XSS | Validar mimype + render seguro |
| Race condition al editar schedule | Server-side es fuente de verdad |
| Colores PDF sin contraste | Hint en UI (no validación dura) |
| Logo pesado | Límite 2MB en upload |

## 📊 Impacto

- **Archivos nuevos:** ~22
- **Archivos modificados:** ~12
- **Sin dependencias npm nuevas** (usa `fs/promises`, `crypto`, `path` nativos)
