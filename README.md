# VeteriApp - Sistema de Gestión de Citas para Clínicas Veterinarias

VeteriApp es un software integral para la gestión de clínicas veterinarias, que permite administrar clientes, mascotas, citas y el historial médico de los pacientes.

![VeteriApp](./banner.png)

## Funcionalidades

### Módulos Implementados

- **Autenticación y Roles**: Sistema de autenticación con JWT (cookies HttpOnly), roles diferenciados (Admin, Veterinario, Recepcionista, Cliente), validacion de RUT chileno
- **Recuperación de Contraseña**: Flujo completo con token cryptografico de un solo uso (almacenado en BD), email con enlace de reseteo, expiracion de 60 minutos
- **Gestión de Usuarios y Clientes**: CRUD completo con paginacion y busqueda
- **Gestión de Mascotas**: Registro completo con especie, raza, fecha nacimiento, peso, sexo, estado reproductivo, microchip, caracteristicas especiales
- **Agendamiento de Citas**: Calendario FullCalendar con vistas mes/semana/dia, panel lateral con resumen del dia, modal de citas pendientes con acciones rapidas, validacion de horarios de clinica y feriados
- **Módulo de Historial Médico**:
  - Registro de Vaccunaciones con tipos específicos (Óctuple, Séxtuple, Triple Felina, Antirrábica)
  - Control de desparasitación (interna y externa)
  - Antecedentes quirúrgicos
  - Alergias y patologías crónicas
  - Registro de consultas con constantes fisiológicas (peso, temperatura, FC, FR, tiempo de repoblacion capilar, deshidratacion, mucosas)
  - Notas públicas y privadas
- **Generación de PDF de Historial Médico**:
  - Exportación completa del historial médico en formato PDF
  - Incluye: datos de mascota/propietario, vacunas, desparasitaciones, quirúrgicos, alergias/patologías y consultas
  - Logo y colores de la clinica personalizables desde configuracion
  - Disponible en admin y portal del cliente
- **Dashboard Veterinario**:
  - KPIs en tiempo real: citas del dia, mascotas activas, proxima cita
  - Distribucion por especie (ApexCharts donut)
  - Citas por estado (ApexCharts bar horizontal)
  - Ranking de veterinarios por citas atendidas
  - Selector de rango (Mes actual / Mes anterior / Trimestre / Ano) persistente en URL
  - Filtro automatico por rol (VET solo ve sus metricas)
- **Notificaciones por Email (Resend API)**:
  - 4 templates HTML: cita creada, confirmada, cancelada, completada
  - Layout base reutilizable con logo y colores de la clinica
  - Disparados automaticamente por la API de citas
  - Soporte para modo test (resend.dev)
- **Configuración del Sistema** (solo ADMIN):
  - Horarios de atencion editables por dia de la semana
  - Gestion de dias feriados (CRUD completo)
  - Personalizacion de marca: nombre, logo (PNG/JPG/SVG), colores primario/secundario, email remitente, texto de pie
  - API publica para validacion de horarios en portal del cliente
- **Perfil de Usuario**:
  - Edicion de datos personales (nombre, email, telefono, direccion, region/comuna)
  - Cambio de contrasena con validacion de contrasena actual
- **Portal del Cliente**:
  - `/portal/mis-mascotas` - Listado y detalle de mascotas del cliente
  - `/portal/mis-citas` - Historial y proximas citas con badges de estado
  - `/portal/agendar-citas` - Solicitud de cita con validacion de horarios
  - `/portal/historial-medico` - Vista simplificada con notas publicas y calendario de vacunas
  - `/portal/perfil` - Datos personales y cambio de contrasena
- **Validación de Requests con Zod**:
  - Todos los endpoints de API validados con schemas Zod
  - Tipos de datos verificados (emails, fechas ISO, enums)
  - Validacion de horarios y limites (Zod refine)
  - Errores estructurados con ruta del campo y mensaje descriptivo
- **Sistema de Auditoria**:
  - Logs con hash encadenado (blockchain-like) para integridad
  - Deteccion de cambios de campos (detectFieldChanges)
  - Exportacion a CSV y PDF
  - Verificacion de integridad de logs
- **Infraestructura de Testing**:
  - Jest 30 + ts-jest configurado
  - 263+ tests unitarios en 7 archivos
  - Mocks de Prisma, Logger y JWT

### Funcionalidades Pendientes (Post-MVP)

- **Facturacion e Ingresos**: Modelo `Invoice` en Prisma, campo `price` en `Category`, calculo real de ingresos en dashboard
- **Subida de Archivos**: Integracion con Supabase Storage / S3 / Cloudinary para examenes, radiografias y recetas
- **Configuracion del Sistema**: **COMPLETADA** - Horarios, feriados y marca (logo, colores, nombre)
- **Recordatorios Automaticos**: Cron jobs para citas 24h antes, vacunas proximas y follow-up post-consulta
- **Reportes Avanzados**: Ingresos por periodo, citas por veterinario, estadisticas de cancelaciones/no-shows, exportacion a Excel/PDF
- **Notificaciones Push y SMS**: Integracion con Twilio y Web Push

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16.2 (App Router, API Routes) |
| Lenguaje | TypeScript 5.x |
| Estilos | Tailwind CSS 4.3 |
| ORM | Prisma 6.x |
| Base de Datos | PostgreSQL (Supabase Neon) |
| Autenticación | Custom JWT (jose) + bcryptjs |
| Validación | Zod 4.x (validación de requests en API routes) |
| Notificaciones | Resend API (emails transaccionales) ✅ |
| UI Components | FullCalendar, ApexCharts |
| Generación PDF | jsPDF + jspdf-autotable |
| Testing | Jest 30 + ts-jest + @testing-library |

## Requisitos Previos

- Node.js 18.x o posterior (recomendado Node.js 20+)
- PostgreSQL (puede usar Supabase Neon para desarrollo)
- pnpm (o npm/yarn)

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/Gestion-citas.git
cd Gestion-citas
```

2. Instalar dependencias:

```bash
pnpm install
# o
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/database"
JWT_SECRET="tu-secret-key-muy-segura"
RESEND_API_KEY="tu-api-key-de-resend"
```

4. Generar el cliente de Prisma y aplicar migraciones:

```bash
pnpm prisma generate
pnpm prisma db push
```

5. Iniciar el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## Modelo de Datos

El esquema de base de datos está definido en `prisma/schema.prisma` con los siguientes modelos principales:

### Modelos de Usuario y Autenticación

- **User**: Usuarios del sistema con roles (ADMIN, VET, RECEPTIONIST, CLIENT)
- Campos: id, email, password, firstName, lastName, rut, phone, address, regionId, comunaId, role

### Modelos de Geografía

- **Region**: Regiones chilenas
- **Comuna**: Comunas asociadas a regiones

### Modelos de Negocio

- **Pet**: Mascotas registradas
  - Campos: id, name, species, breed, birthDate, weight, sex, reproductiveStatus, specialCharacteristics, microchipNumber, ownerId

- **Appointment**: Citas del sistema
  - Estados: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
  - Campos: id, date, reason, status, notes, petId, vetId, categoryId

- **Category**: Categorías de citas (vacunación, cirugía, consulta general, etc.)
  - Campos: id, name, color

- **MedicalRecord**: Registros de consultas médicas
  - Campos: id, date, title, diagnosis, treatment, publicNotes, privateNotes, petId, vetId

- **VitalSigns**: Signos vitales de cada consulta
  - Campos: id, weight, temperature, heartRate, respiratoryRate, capillaryRefillTime, dehydrationPercentage, mucousMembranes, medicalRecordId

- **ExamAttachment**: Archivos adjuntos de exámenes
  - Campos: id, fileName, fileUrl, fileType, description, medicalRecordId

- **Vaccination**: Registro de vacunas
  - Campos: id, vaccineName, vaccineType, administrationDate, nextDoseDate, lotNumber, manufacturer, veterinarian, petId, createdById

- **Deworming**: Registro de desparasitaciones
  - Tipos: INTERNAL, EXTERNAL, BOTH
  - Campos: id, productName, type, dosage, date, nextDate, petId, createdById

- **SurgicalHistory**: Antecedentes quirúrgicos
  - Campos: id, procedure, date, complications, notes, outcomes, petId

- **ChronicCondition**: Alergias y patologías crónicas
  - Campos: id, name, type, severity, diagnosisDate, notes, isActive, petId

- **ClinicSetting**: Configuración general de la clínica (key-value JSON)
  - Keys: "schedule" (horarios semanales), "branding" (nombre, colores, logo, email)
  - Campos: id, key, value, updatedAt, updatedById

- **ClinicHoliday**: Días no laborables
  - Campos: id, date, label, createdById, createdAt

### Relaciones entre Modelos

```
User (owner) 1──N Pet
Pet 1──N Appointment
Pet 1──N MedicalRecord
Pet 1──N Vaccination
Pet 1──N Deworming
Pet 1──N SurgicalHistory
Pet 1──N ChronicCondition
MedicalRecord 1──1 VitalSigns
MedicalRecord 1──N ExamAttachment
Appointment N──1 Pet
Appointment N──1 User (vet)
Appointment N──1 Category
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── (admin)/               # Panel de administración (staff)
│   │   └── (others-pages)/
│   │       ├── historial-medico/    # Módulo de historial médico
│   │       ├── mascotas/           # Gestión de mascotas
│   │       └── ...
│   ├── portal/                # Portal del cliente
│   │   ├── historial-medico/       # Vista del cliente
│   │   ├── mis-citas/              # Citas del cliente
│   │   ├── mis-mascotas/           # Mascotas del cliente
│   │   └── agendar-citas/          # Solicitar nueva cita
│   ├── api/
│   │   └── v1/                # API Routes
│   │       ├── auth/          # Autenticación
│   │       ├── clients/       # Gestión de clientes
│   │       ├── pets/          # Mascotas (incluye sub-rutas: vaccinations, deworming, etc.)
│   │       ├── appointments/  # Citas
│   │       ├── medical-records/ # Historial médico y consultas
│   │       └── ...
│   └── signin/                # Página de inicio de sesión
├── components/
│   ├── ui/                   # Componentes UI base
│   ├── form/                 # Formularios reutilizables
│   ├── calendar/             # Componente calendario
│   └── ...
├── lib/
│   ├── prisma.ts            # Cliente Prisma
│   ├── jwt.ts                # Configuración JWT compartida (secret, payload, verify)
│   ├── auth.ts               # Helpers de autenticación (re-exporta desde jwt.ts)
│   ├── auth-helper.ts        # Helpers de autenticación server-side
│   ├── api-response.ts      # Respuestas API estandarizadas
│   ├── validations.ts       # Schemas Zod para validación de requests
│   ├── audit.ts             # Sistema de auditoría
│   ├── audit-signature.ts   # Integridad criptográfica de logs
│   ├── audit-pdf.ts         # Exportación PDF de auditoría
│   ├── medical-history-pdf.ts # Generación de PDF del historial médico
│   └── logger.ts            # Sistema de logs (pino + winston)
├── types/
│   └── index.ts             # TypeScript DTOs
├── test/                    # Tests unitarios (Jest + ts-jest)
│   ├── setup.ts             # Configuración global de mocks
│   ├── __mocks__/           # Mocks de módulos externos
│   └── unit/                # Tests unitarios
│       ├── lib/             # Tests de lib/
│       └── services/        # Tests de services/
└── proxy.ts             # Proxy de autenticación (Next.js 16)
```

## API Routes

> **Nota**: Todas las rutas POST/PUT validan el body de la request con schemas Zod definidos en `src/lib/validations.ts`. Los errores retornan `{ success: false, error: "campo: mensaje" }` con código 400.

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/session` - Obtener sesión actual
- `POST /api/v1/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/v1/auth/reset-password` - Restablecer contraseña con token

### Gestión de Usuarios
- `GET/POST /api/v1/users` - Listar/Crear usuarios
- `GET/PUT/DELETE /api/v1/users/[id]` - Gestionar usuario individual

### Gestión de Clientes
- `GET/POST /api/v1/clients` - Listar/Crear clientes
- `GET/PUT/DELETE /api/v1/clients/[id]` - Gestionar cliente individual

### Gestión de Veterinarios
- `GET /api/v1/vets` - Listar veterinarios disponibles

### Gestión de Mascotas
- `GET/POST /api/v1/pets` - Listar/Crear mascotas
- `GET/PUT/DELETE /api/v1/pets/[id]` - Gestionar mascota individual
- `GET/POST /api/v1/pets/[id]/vaccinations` - Vacunas
- `GET/POST /api/v1/pets/[id]/deworming` - Desparasitación
- `GET/POST /api/v1/pets/[id]/surgical-history` - Quirúrgicos
- `GET/POST /api/v1/pets/[id]/chronic-conditions` - Alergias/Patologías

### Historial Médico
- `GET/POST /api/v1/medical-records` - Listar/Crear entradas
- `GET/PUT/DELETE /api/v1/medical-records/[id]` - Gestionar entrada individual
- `GET/POST /api/v1/medical-records/[id]/exams` - Adjuntos de exámenes

### Dashboard (Fase 6)
- `GET /api/v1/dashboard?range=month|prev|quarter|year` - Métricas agregadas (KPIs, distribuciones, top vets, próximas citas)

### Perfil de Usuario
- `GET/PUT /api/v1/profile` - Obtener/actualizar datos del usuario autenticado
- `PUT /api/v1/profile/password` - Cambiar contraseña

### Configuración del Sistema (ADMIN)
- `GET /api/v1/configuracion` - Obtener configuracion completa (schedule, holidays, branding)
- `PUT /api/v1/configuracion/schedule` - Actualizar horarios de atencion
- `GET/POST /api/v1/configuracion/holidays` - Listar/crear feriados
- `DELETE /api/v1/configuracion/holidays/[id]` - Eliminar feriado
- `PUT /api/v1/configuracion/branding` - Actualizar marca (nombre, colores, footer, email)
- `POST /api/v1/configuracion/branding/logo` - Subir logo
- `GET /api/v1/public/settings` - Datos publicos de horarios y feriados (para portal cliente)

### Citas
- `GET/POST /api/v1/appointments` - Listar/Crear citas
- `GET/PUT/DELETE /api/v1/appointments/[id]` - Gestionar cita individual

### Categorías
- `GET/POST /api/v1/categories` - Listar/Crear categorías
- `GET/PUT/DELETE /api/v1/categories/[id]` - Gestionar categoría individual

### Regiones y Comunas
- `GET/POST /api/v1/regions` - Listar/Crear regiones
- `GET/POST /api/v1/comunas` - Listar/Crear comunas

## Roles y Permisos

| Módulo | ADMIN | VET | RECEPTIONIST | CLIENTE |
|--------|-------|-----|--------------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Gestión de Usuarios | ✅ | ❌ | ❌ | ❌ |
| Gestión de Clientes | ✅ | 👁️ | ✅ | ❌ |
| Gestión de Mascotas | ✅ | ✅ | ✅ | ✅ |
| Agendamiento de Citas | ✅ | ✅ | ✅ | ✅ |
| Confirmar/Cancelar Citas | ✅ | ✅ | ✅ | ❌ |
| Historial Médico | ✅ | ✅ | ❌ | ✅ |
| Exportar PDF | ✅ | ✅ | ❌ | ✅ |

## Reglas de Negocio Implementadas

- **RN-01 a RN-05**: Autenticación y roles
- **RN-06 a RN-09**: Gestión de mascotas
- **RN-10 a RN-16**: Agendamiento de citas
- **RN-17 a RN-25**: Historial médico (completo)

## Flujo de Citas

### Creación de Citas
1. El **cliente** solicita cita a través del portal
2. La cita se crea con estado `PENDING` (pendiente de confirmación)
3. El **staff** (admin/vet/receptionist) visualiza la cita en el calendario
4. Al hacer click en el banner de notificaciones, se abre un modal con todas las citas pendientes
5. El staff puede **confirmar** o **cancelar** la cita directamente desde el modal

### Estados de Cita
- `PENDING`: Esperando confirmación del staff
- `CONFIRMED`: Confirmada, lista para la fecha scheduled
- `COMPLETED`: La cita se realizó exitosamente
- `CANCELLED`: La cita fue cancelada (por staff o por reversa del cliente)
- `NO_SHOW`: El cliente no asistió a la cita

## Estado de Desarrollo

| Fase | Descripción | Estado | Fecha |
|------|-------------|--------|-------|
| Fase 1 | Inicialización del template | ✅ Completada | 2026-06-08 |
| Fase 2 | Modelado de datos y autenticación | ✅ Completada | 2026-06-08 |
| Fase 3 | Módulos de gestión (usuarios, clientes, mascotas) | ✅ Completada | 2026-06-08 |
| Fase 4 | Módulo de citas y calendario | ✅ Completada | 2026-06-09 |
| Fase 5 | Módulo de historial médico | ✅ Completada | 2026-06-09 |
| Fase 5.1 | Generación de PDF del historial médico | ✅ Completada | 2026-06-09 |
| Fase 5.2 | Modal de confirmación de citas pendientes | ✅ Completada | 2026-06-09 |
| Fase 6.0 | Dashboard y métricas veterinarias | ✅ Completada | 2026-07-01 |
| Fase 6.1 | Notificaciones por email (Resend) | ✅ Completada | 2026-07-02 |
| Fase 6.2 | Configuración del sistema (horarios, feriados, marca) | ✅ Completada | 2026-07-03 |
| Fase 6.3 | Perfil de usuario real y recuperación de contraseña | ✅ Completada | 2026-07-05 |
| Fase 6.4 | Portal "Mis Mascotas" completo | ✅ Completada | 2026-07-05 |
| Fase 7 | Testing, pulido y despliegue | 🟡 En progreso | - |
| Fase 7.1 | Infraestructura de tests unitarios | ✅ Completada | 2026-07-01 |

## Scripts Disponibles

```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Compilar para producción
pnpm start        # Iniciar servidor de producción
pnpm lint         # Verificar código con ESLint
pnpm typecheck    # Verificar tipos con TypeScript
pnpm prisma       # Gestionar migraciones de Prisma
```

## Testing

El proyecto cuenta con una infraestructura completa de tests unitarios utilizando **Jest 30**, **ts-jest** y **@testing-library**.

### Estructura de Tests

```
src/
├── test/
│   ├── setup.ts                    # Configuración global de mocks
│   ├── __mocks__/
│   │   └── jose.ts                 # Mock de la librería jose (JWT)
│   └── unit/
│       ├── lib/
│       │   ├── validations.test.ts  # Tests de schemas Zod (166 tests)
│       │   ├── jwt.test.ts          # Tests de autenticación JWT (18 tests)
│       │   ├── api-response.test.ts # Tests de helpers API (22 tests)
│       │   └── audit.test.ts        # Tests de auditoría (28 tests)
│       └── services/
│           └── audit-signature.test.ts # Tests de firma criptográfica (29 tests)
├── lib/
│   ├── validations.ts              # 50+ schemas Zod para validación
│   ├── jwt.ts                      # Creación y verificación de tokens JWT
│   ├── api-response.ts             # Helpers de respuestas API estandarizadas
│   └── audit.ts                    # Sistema de auditoría con hash criptográfico
└── services/
    └── audit-signature.ts          # Funciones de hash y firma para integridad
```

### Scripts de Testing

```bash
pnpm test          # Ejecutar tests en modo watch
pnpm test:run      # Ejecutar tests una vez
pnpm test:coverage # Ejecutar tests con coverage report
```

### Cobertura de Tests

| Módulo | Tests | Descripción |
|--------|-------|-------------|
| `validations.ts` | 166 | Todos los schemas Zod (Login, Register, CreateUser, etc.) |
| `jwt.ts` | 18 | createToken, verifyToken, expiración, payloads |
| `api-response.ts` | 22 | successResponse, errorResponse, unauthorizedResponse, etc. |
| `audit.ts` | 28 | detectFieldChanges, getClientIp, createAuditLog |
| `audit-signature.ts` | 29 | calculateHash, generateSignature, verifySignature |
| `dashboard-metrics.ts` | +15 | Cálculo de KPIs, distribuciones, ranking vets |
| `dashboard-query.ts` | +5 | Query builders para dashboard |
| **Total** | **263+** | **Cobertura de módulos core** |

### Mocks Configurados

- `@/lib/prisma` - Cliente Prisma mockeado para evitar acceso a BD
- `@/lib/logger` - Logger mockeado (pino + winston)
- `jose` - JWT mockeado para testing de autenticación
- `@/services/dashboard-metrics` - Métricas mockeadas para tests
- `@/lib/auth-helper` - Auth helper mockeado

### Configuración

- **Jest config**: `jest.config.js`
- **Setup de tests**: `src/test/setup.ts`
- **Coverage**: Se genera en carpeta `coverage/` (HTML y LCOV)

## Licencia

MIT License

## Soporte

Para reportar issues o contribuir al proyecto, por favor crea un pull request o abre un issue en el repositorio.