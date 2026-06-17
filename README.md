# VeteriApp - Sistema de Gestión de Citas para Clínicas Veterinarias

VeteriApp es un software integral para la gestión de clínicas veterinarias, que permite administrar clientes, mascotas, citas y el historial médico de los pacientes.

![VeteriApp](./banner.png)

## Funcionalidades

### Módulos Implementados

- **Autenticación y Roles**: Sistema de autenticación con JWT, roles diferenciados (Admin, Veterinario, Recepcionista, Cliente)
- **Gestión de Usuarios y Clientes**: CRUD completo de usuarios con validación de RUT chileno
- **Gestión de Mascotas**: Registro de mascotas con información detallada (especie, raza, estado reproductivo, microchip)
- **Agendamiento de Citas**: Sistema de citas con calendario (FullCalendar), estados variables, flujo online/offline
- **Módulo de Historial Médico** (Fase 5 - Completada):
  - Registro de Vaccunaciones con tipos específicos (Óctuple, Séxtuple, Triple Felina, Antirrábica)
  - Control de desparasitación (interna y externa)
  - Antecedentes quirúrgicos
  - Alergias y patologías crónicas
  - Registro de consultas con constantes fisiológicas (peso, temperatura, FC, FR)
  - Notas públicas y privadas
- **Generación de PDF de Historial Médico** (Nueva funcionalidad):
  - Exportación completa del historial médico en formato PDF
  - Incluye: datos de mascota/propietario, vacunas, desparasitaciones, quirúrgicos, alergias/patologías y consultas
  - Disponible tanto en panel admin como en portal del cliente
- **Gestión de Citas Pendientes** (Nueva funcionalidad):
  - Panel de notificaciones en el calendario con conteo de citas pendientes
  - Modal interactivo para confirmar o cancelar citas pendientes de forma rápida
  - Integración directa con el flujo de reversa de citas del cliente
- **Validación de Requests con Zod**:
  - Todos los endpoints de API validados con schemas Zod
  - Tipos de datos verificados (emails, UUIDs, fechas ISO)
  - Validación de rangos y valores permitidos (enums, números positivos)
  - Errores estructurados con ruta del campo y mensaje descriptivo

### Funcionalidades Pendientes (Fases 6-7)

- Dashboard con estadísticas (ApexCharts)
- Sistema de notificaciones por email (Resend)
- Recordatorios automáticos de citas

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
| Notificaciones | Resend API (pendiente) |
| UI Components | FullCalendar, ApexCharts |
| Generación PDF | jsPDF + jspdf-autotable |

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
│   ├── auth-helper.ts       # Helpers de autenticación
│   ├── api-response.ts      # Respuestas API estandarizadas
│   ├── validations.ts       # Schemas Zod para validación de requests
│   ├── audit.ts             # Sistema de auditoría
│   ├── audit-signature.ts   # Integridad criptográfica de logs
│   ├── audit-pdf.ts         # Exportación PDF de auditoría
│   ├── medical-history-pdf.ts # Generación de PDF del historial médico
│   └── logger.ts            # Sistema de logs (pino + winston)
├── types/
│   └── index.ts             # TypeScript DTOs
└── middleware.ts            # Middleware de autenticación
```

## API Routes

> **Nota**: Todas las rutas POST/PUT validan el body de la request con schemas Zod definidos en `src/lib/validations.ts`. Los errores retornan `{ success: false, error: "campo: mensaje" }` con código 400.

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/session` - Obtener sesión actual

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

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 1 | Inicialización del template | ✅ Completada |
| Fase 2 | Modelado de datos y autenticación | ✅ Completada |
| Fase 3 | Módulos de gestión (usuarios, clientes, mascotas) | ✅ Completada |
| Fase 4 | Módulo de citas y calendario | ✅ Completada |
| Fase 5 | Módulo de historial médico | ✅ Completada |
| Fase 5.1 | Generación de PDF del historial médico | ✅ Completada |
| Fase 5.2 | Modal de confirmación de citas pendientes | ✅ Completada |
| Fase 6 | Dashboard y notificaciones | ⏳ Pendiente |
| Fase 7 | Testing, pulido y despliegue | ⏳ Pendiente |

## Scripts Disponibles

```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Compilar para producción
pnpm start        # Iniciar servidor de producción
pnpm lint         # Verificar código con ESLint
pnpm typecheck    # Verificar tipos con TypeScript
pnpm prisma       # Gestionar migraciones de Prisma
```

## Licencia

MIT License

## Soporte

Para reportar issues o contribuir al proyecto, por favor crea un pull request o abre un issue en el repositorio.