# Documento Maestro: Software de Gestión de Citas para Veterinaria

## 1. Información General del Proyecto

| Atributo | Detalle |
| :--- | :--- |
| **Nombre del Sistema** | VeteriApp |
| **Descripción** | Software para la gestión integral de citas, clientes, mascotas e historial médico de una clínica veterinaria. |
| **Repositorio** | `Gestion-citas` |
| **Template Base** | `free-nextjs-admin-dashboard` |
| **Fecha de Inicio** | 2026-06-08 |

## 2. Stack Tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Framework** | Next.js | v16.2 (App Router, API Routes) |
| **Lenguaje** | TypeScript | v5.x |
| **Estilos** | Tailwind CSS | v4.3 |
| **ORM** | Prisma | Última estable |
| **Base de Datos** | PostgreSQL | Alojada en Supabase |
| **Autenticación** | Custom JWT (jose) + bcryptjs | Email/Contraseña |
| **Notificaciones (MVP)** | Email | Resend API |
| **UI Components** | FullCalendar, ApexCharts | Integrados en el template |

---

## 3. Reglas de Negocio

### 3.1 Usuarios y Autenticación

* **RN-01:** Un usuario debe tener un rol único y obligatorio: `ADMIN`, `VET`, `RECEPTIONIST` o `CLIENT`.
* **RN-02:** El correo electrónico de un usuario debe ser único en el sistema.
* **RN-03:** La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula y un número.
* **RN-04:** Solo un usuario con rol `ADMIN` puede crear nuevos usuarios con roles `ADMIN`, `VET` o `RECEPTIONIST`.
* **RN-05:** Los clientes se registran por sí mismos a través del portal público.

### 3.2 Gestión de Mascotas

* **RN-06:** Una mascota debe estar vinculada obligatoriamente a un único cliente (`User` con rol `CLIENT`).
* **RN-07:** El nombre de la mascota y la especie son campos obligatorios.
* **RN-08:** Un cliente puede tener múltiples mascotas.
* **RN-09:** Un veterinario o un admin puede editar los datos de cualquier mascota. Un `RECEPTIONIST` solo puede editar datos existentes.

### 3.3 Agendamiento de Citas

* **RN-10:** Una cita debe estar vinculada a una mascota, un cliente (dueño) y opcionalmente a un veterinario.
* **RN-11:** Los estados de una cita son: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
* **RN-12:** **Flujo Online (Clientes):** Un cliente crea una cita con estado `PENDING`. Un `RECEPTIONIST` o `ADMIN` debe cambiarla a `CONFIRMED` y asignar un veterinario para que sea oficial.
* **RN-13:** **Flujo Offline (Staff):** Un `RECEPTIONIST` o `ADMIN` puede crear una cita directamente en estado `CONFIRMED` si el veterinario y el horario están disponibles.
* **RN-14:** No se puede crear una cita en un horario pasado.
* **RN-15:** No se puede crear una cita en un horario que ya está ocupado por el mismo veterinario.
* **RN-16:** Un veterinario solo puede ver y gestionar las citas a las que está asignado.

### 3.4 Historial Médico

* **RN-17:** Cada entrada del historial médico está vinculada a una mascota y a un veterinario (quien la creó).
* **RN-18:** Las entradas deben tener un campo `publicNotes` (visible para el dueño) y un campo `privateNotes` (solo para `VET` y `ADMIN`).
* **RN-19:** Un cliente solo puede ver las entradas del historial de sus propias mascotas.
* **RN-20:** Un veterinario solo puede editar/eliminar sus propias entradas de historial.
* **RN-21 (Vacunación):** El calendario de vacunación de cada mascota debe registrar el tipo de vacuna, la fecha de administración y la fecha de la próxima dosis.
  * **RN-21.1 (Perros):** Se debe registrar la aplicación de la vacuna Óctuple/Séxtuple (Leptospira, Parvovirus, Moquillo, Hepatitis, Parainfluenza) y la vacuna Antirrábica.
  * **RN-21.2 (Gatos):** Se debe registrar la aplicación de la vacuna Triple Felina (Panleucopenia, Rinotraqueitis, Calicivirus), la vacuna de la Leucemia Felina y la vacuna Antirrábica.
  * **RN-21.3:** La vacuna Antirrábica es obligatoria para todas las especies y debe registrarse su administración anual.
* **RN-22 (Desparasitación):** El control de desparasitación debe registrar tanto tratamientos para parásitos internos como externos, incluyendo fecha de aplicación y producto utilizado.
* **RN-23 (Antecedentes Quirúrgicos):** Se debe llevar un registro de cirugías previas, procedimientos de esterilización/castración y cualquier complicación postoperatoria.
* **RN-24 (Alergias y Patologías Crónicas):** Debe existir un registro permanente de alergias conocidas (alimentarias, ambientales, farmacológicas) y patologías crónicas diagnosticadas (diabetes, insuficiencia renal, etc.).
* **RN-25 (Registro de Atenciones):** Cada consulta debe registrar fecha, motivo, constantes fisiológicas (peso, temperatura, frecuencia cardíaca, frecuencia respiratoria) y un espacio para diagnóstico y tratamientos prescritos.

---

## 4. Estructura del Modelo de Datos (Prisma)

```prisma
enum Role {
  ADMIN
  VET
  RECEPTIONIST
  CLIENT
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  pets          Pet[]          // Solo aplica si es CLIENT
  vetAppointments Appointment[] @relation("VetAppointments")
  createdByMedicalRecords MedicalRecord[]
}

model Pet {
  id        Int       @id @default(autoincrement())
  name      String
  species   String
  breed     String?
  birthDate DateTime?
  weight    Float?
  ownerId   Int
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  owner            User          @relation(fields: [ownerId], references: [id])
  appointments     Appointment[]
  medicalRecords   MedicalRecord[]
  vaccinations     Vaccination[]
  dewormingRecords Deworming[]
  surgicalHistory  SurgicalHistory[]
  chronicConditions ChronicCondition[]
}

model Appointment {
  id          Int               @id @default(autoincrement())
  date        DateTime
  reason      String
  status      AppointmentStatus @default(PENDING)
  notes       String?
  petId       Int
  vetId       Int? // Opcional hasta que se confirme
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  pet Pet @relation(fields: [petId], references: [id])
  vet User? @relation("VetAppointments", fields: [vetId], references: [id])
}

model MedicalRecord {
  id             Int           @id @default(autoincrement())
  date           DateTime      @default(now())  // Fecha de la consulta
  title          String                       // Motivo de la consulta
  diagnosis      String?   @db.Text          // Diagnóstico
  treatment      String?   @db.Text          // Tratamiento prescrito
  publicNotes    String   @db.Text
  privateNotes   String?  @db.Text
  petId          Int
  vetId          Int       // Quién creó la entrada
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  pet    Pet          @relation(fields: [petId], references: [id])
  vet    User         @relation(fields: [vetId], references: [id])
  exams  ExamAttachment[]
  vitals VitalSigns?
}

model VitalSigns {
  id                     Int     @id @default(autoincrement())
  weight                 Float?
  temperature            Float?
  heartRate              Int?
  respiratoryRate        Int?
  capillaryRefillTime    String?
  dehydrationPercentage  Float?
  mucousMembranes        String?
  medicalRecordId        Int     @unique
  medicalRecord          MedicalRecord @relation(fields: [medicalRecordId], references: [id])
}

model Vaccination {
  id                Int      @id @default(autoincrement())
  vaccineName       String
  vaccineType       String
  administrationDate DateTime @default(now())
  nextDoseDate      DateTime?
  lotNumber         String?
  manufacturer      String?
  veterinarian      String?
  petId             Int
  createdAt         DateTime @default(now())
  createdById       Int

  pet Pet @relation(fields: [petId], references: [id])
}

model Deworming {
  id           Int      @id @default(autoincrement())
  productName  String
  type         DewormingType
  dosage       String?
  date         DateTime @default(now())
  nextDate     DateTime?
  petId        Int
  createdById  Int
  createdAt    DateTime @default(now())

  pet Pet @relation(fields: [petId], references: [id])
}

enum DewormingType {
  INTERNAL
  EXTERNAL
  BOTH
}

model SurgicalHistory {
  id           Int      @id @default(autoincrement())
  procedure    String
  date         DateTime?
  complicatons String?   @db.Text
  notes        String?   @db.Text
  outcomes     String?   @db.Text
  petId        Int
  createdAt    DateTime @default(now())

  pet Pet @relation(fields: [petId], references: [id])
}

model ChronicCondition {
  id          Int      @id @default(autoincrement())
  name        String
  type        String
  severity    String?
  diagnosisDate DateTime?
  notes       String?  @db.Text
  isActive    Boolean  @default(true)
  petId       Int
  createdAt   DateTime @default(now())

  pet Pet @relation(fields: [petId], references: [id])
}

model ExamAttachment {
  id              Int      @id @default(autoincrement())
  fileName        String
  fileUrl         String
  fileType        String
  description     String?
  medicalRecordId Int
  createdAt       DateTime @default(now())

  medicalRecord MedicalRecord @relation(fields: [medicalRecordId], references: [id])
}
```

---

## 5. Flujos de Módulos

### 5.1 Módulo de Autenticación

1. Usuario accede a `/signin`.
2. Ingresa email y contraseña.
3. Backend verifica credenciales y genera un JWT seguro.
4. El JWT se almacena en una cookie `HttpOnly`.
5. El Middleware de Next.js redirige al dashboard correspondiente según el rol del usuario.

### 5.2 Módulo de Gestión de Mascotas (Admin / Recepcionista)

1. Acceso a la página "Mascotas".
2. Listado con tabla y búsqueda (usando componentes del template).
3. Crear nueva mascota: se selecciona el dueño (cliente) desde un buscador.
4. Editar / Eliminar mascota.

### 5.3 Módulo de Agendamiento de Citas (Staff)

1. Acceso a la página "Calendario" (FullCalendar).
2. El calendario muestra todas las citas por colores según estado.
3. Click en un horario vacío abre un modal para crear cita (flujo rápido).
4. Click en una cita existente abre el detalle para confirmar, reasignar o cancelar.

### 5.4 Flujo de Agendamiento Online (Portal del Cliente)

1. Cliente inicia sesión en el portal.
2. Selecciona una de sus mascotas.
3. Selecciona fecha y horario disponible en el calendario público.
4. Indica el motivo de la consulta.
5. Se crea la cita con estado `PENDING`.
6. Se envía un email al recepcionista/admin notificando la nueva solicitud.
7. El staff revisa, asigna un veterinario y cambia el estado a `CONFIRMED`.
8. El cliente recibe un email de confirmación con los detalles.

### 5.5 Módulo de Historial Médico

1. **Desde el perfil de una mascota**, el veterinario/admin accede a la pestaña "Historial Médico".
2. La interfaz se organiza en secciones o pestañas:
   * **Resumen Sanitario:** Muestra la última información de vacunación y desparasitación, además de alergias/patologías crónicas.
   * **Vacunación:** Formulario para registrar nueva vacuna (nombre, tipo, fecha, próxima dosis). Lista cronológica de vacunas aplicadas.
   * **Desparasitación:** Similar a vacunación, con tipo (interno/externo), producto y periodicidad.
   * **Antecedentes Quirúrgicos:** Registro de cirugías y procedimientos invasivos.
   * **Registro de Atenciones (Consultas):**
     * Formulario de nueva atención con: fecha, motivo, constantes fisiológicas (peso, temperatura, FC, FR, etc.), diagnóstico y tratamiento.
     * Opción para adjuntar exámenes de laboratorio, recetas o imágenes (radiografías).
     * Notas públicas y privadas.
3. **En el portal del cliente:** El dueño accede a su mascota y ve un resumen sanitario simplificado, accede a las notas públicas de las consultas y puede ver el calendario de vacunación próximo.

---

## 6. Roles y Sus Módulos

| Módulo | ADMIN | VET | RECEPTIONIST | CLIENTE |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard | ✅ Completo | ✅ Sus Citas/Pacientes | ✅ Calendario General | ✅ Mis Citas |
| Gestión de Usuarios | ✅ | ❌ | ❌ | ❌ |
| Gestión de Clientes | ✅ | 👁️ Ver (sus pacientes) | ✅ CRUD | ❌ |
| Gestión de Mascotas | ✅ | ✅ CRUD (sus pacientes) | ✅ Crear/Editar | ✅ Ver sus mascotas |
| Agendamiento de Citas | ✅ CRUD + Asignar Vets | ✅ Ver/Editar (sus citas) | ✅ CRUD + Confirmar | ✅ Solicitar (Pendiente) |
| Historial Médico (General) | ✅ Ver/Editar Todo | ✅ CRUD (sus pacientes) | ❌ | ✅ Ver Notas Públicas |
| Vacunación | ✅ Ver/Editar Todo | ✅ CRUD (sus pacientes) | ❌ | ✅ Ver Calendario Próximo |
| Desparasitación | ✅ Ver/Editar Todo | ✅ CRUD (sus pacientes) | ❌ | ✅ Ver Historial |
| Antecedentes Quirúrgicos | ✅ Ver/Editar Todo | ✅ CRUD (sus pacientes) | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ | ❌ |

---

## 7. Fases de Implementacion del Desarrollo

### Fase 1: Inicializacion e Integracion del Template (Dias 1-2) ✅ COMPLETADA

* Copiar y limpiar el template base en el repositorio.
* Configurar el proyecto Next.js con Prisma y la conexion a Supabase.
* Establecer la estructura de rutas: `(admin)`, `(portal)`, `(auth)`.
* Instalar dependencias faltantes (jose, bcryptjs, resend).

### Fase 2: Modelado de Datos y Autenticacion (Dias 3-4) ✅ COMPLETADA

* Definir el `schema.prisma` final.
* Ejecutar la primera migracion (`prisma migrate dev`).
* Implementar el sistema de registro y login (API Routes + JWT en cookies).
* Desarrollar el Middleware de proteccion de rutas por roles.

### Fase 3: Modulos de Gestion (Dias 5-8) ✅ COMPLETADA

* CRUD de Usuarios y Clientes.
* CRUD de Mascotas.
* UI con componentes del template (tablas, formularios).

### Fase 4: Modulo de Citas y Calendario (Dias 9-12) ✅ COMPLETADA

* Integracion del componente FullCalendar para el staff.
* Implementar la logica de creacion de citas (offline y online).
* Desarrollar el flujo de confirmacion manual (`PENDING` -> `CONFIRMED`).
* Desarrollar el portal del cliente para solicitar citas.
  * **Calendario interactivo con:**
  * Panel lateral (side panel) con resumen del dia, proxima cita, atajos rapidos
  * Sistema de disenio clinico personalizado con CSS Modules (`Calendar.module.css`, `CalendarSidePanel.module.css`)
  * Modal de citas pendientes con contador y acciones rapidas
  * Modal de detalle de cita con cambio de estados y eliminacion
  * Notificacion visual de citas pendientes
  * Validacion de conflicto de horario por veterinario
  * **Validacion de horarios de clinica y feriados desde configuracion del sistema**

### Fase 5: Modulo de Historial Medico (Dias 13-16) ✅ COMPLETADA

**Implementacion completada (2026-06-09):**

* **Modelos de datos (Prisma):**
  * Nuevo enum `DewormingType` (INTERNAL, EXTERNAL, BOTH).
  * Modelo `VitalSigns` para constantes fisiologicas (peso, temperatura, FC, FR, etc.).
  * Modelo `ExamAttachment` para adjuntos de examenes (recetas, radiografias).
  * Modelo `Vaccination` con campos para tipo de vacuna, fechas y fabricante.
  * Modelo `Deworming` con tipo de parasito y producto.
  * Modelo `SurgicalHistory` para antecedentes quirurgicos.
  * Modelo `ChronicCondition` para alergias y patologias cronicas.
  * Actualizado `MedicalRecord` con campos `date`, `diagnosis`, `treatment` y relaciones.

* **API Routes:**
  * `GET/POST /api/v1/medical-records` - CRUD de atenciones.
  * `GET/PUT/DELETE /api/v1/medical-records/[id]` - Gestion individual.
  * `GET/POST /api/v1/medical-records/[id]/exams` - Adjuntos.
  * `GET/POST /api/v1/pets/[id]/vaccinations` - Vacunas.
  * `GET/POST /api/v1/pets/[id]/deworming` - Desparasitacion.
  * `GET/POST /api/v1/pets/[id]/surgical-history` - Quirurgicos.
  * `GET/POST /api/v1/pets/[id]/chronic-conditions` - Alergias/Patologias.

* **Frontend Admin (`/historial-medico`):**
  * Selector de mascota.
  * Tabs: Resumen, Vacunas, Desparasitacion, Quirurgicos, Consultas, Alergias/Patologias.
  * Dashboard con estadisticas visuales por categoria.
  * Formularios modales para registrar cada tipo of dato.
  * Vista detallada de consultas con constantes fisiologicas y notas.

* **Frontend Portal Cliente (`/portal/historial-medico`):**
  * Selector de mascota del cliente.
  * Vista simplificada con tabs por categoria.
  * Solo notas publicas visibles para el cliente.
  * Generacion de PDF del historial medico.

### Fase 6: Dashboard, Notificaciones y Email (Dias 15-18) ✅ COMPLETADA

**Fase 6.0 — Dashboard Veterinario ✅ COMPLETADA (2026-07-01)**

* Implementar el Dashboard de indicadores reales con datos de Prisma.
* Endpoint `GET /api/v1/dashboard?range=month|prev|quarter|year` con validacion Zod y auditoria.
* Servicio puro `services/dashboard-metrics.ts` (sin HTTP) para reuso desde server components.
* KPIs: citas del dia, mascotas activas (con citas ultimos 12 meses + futuras), ingresos del mes (placeholder 0 hasta existir Invoice/price), proxima cita.
* Distribuciones: citas por estado (bar horizontal), distribucion por especie (donut).
* Tendencias: ranking de veterinarios por citas en el rango.
* Lista de proximas 5 citas con badge de estado y color de categoria.
* Selector de rango persistente en URL.
* Filtro por rol: `VET` => solo sus citas (RN-16).
* Tests unitarios en `src/test/unit/services/dashboard-metrics.test.ts` y `src/test/unit/lib/dashboard-query.test.ts`.

**Fase 6.1 — Notificaciones por Email ✅ COMPLETADA (2026-07-02)**

* Integracion con Resend API para envio de emails transaccionales.
* 4 Templates React Email (HTML):
  * `appointment-created.tsx` - Cita creada/solicitada
  * `appointment-confirmed.tsx` - Cita confirmada
  * `appointment-cancelled.tsx` - Cita cancelada
  * `appointment-completed.tsx` - Cita completada
* Layout base reutilizable (`base.layout.tsx`)
* Emails automaticos disparados por API de citas (POST `appointments/`, PUT `appointments/[id]`)
* Manejo de errores no bloqueante con logs en consola
* Soporte para modo test (`resend.dev` domain en desarrollo)

**Fase 6.2 — Recordatorios Automaticos ⏳ PENDIENTE**

* Implementar cron jobs (Vercel Cron o similares).
* Recordatorio de citas 24h antes.
* Recordatorio de vacunas proximas a vencer.
* Follow-up post-consulta.

### Fase 7: Testing, Pulido y Despliegue (Dias 17-18) ✅ COMPLETADA

* Pruebas funcionales de cada flujo.
* Correccion de bugs y optimizacion de rendimiento.
* Despliegue en Vercel.

### Fase 8: Modulos Faltantes y Mejoras (Post-MVP)

#### 8.1 Perfil de Usuario y Recuperacion de Contrasena ✅ COMPLETADO (2026-07-05)
- ✅ **Perfil de usuario real** (`/admin/profile`) - Datos reales con edicion de nombre, email, telefono, direccion, region y comuna.
- ✅ **Cambio de contrasena** - Modal con validacion de contrasena actual y nueva.
- ✅ **Recuperacion de contrasena** - Flujo completo "Olvide mi contrasena" con email de reseteo via token.

#### 8.2 Portal del Cliente (Parcial)
- ✅ **`/portal/mis-mascotas`** - Listado de mascotas del cliente con detalle, selector y acciones rapidas.
- ✅ `/portal/mis-citas` - Implementado funcionalmente.
- ✅ `/portal/agendar-citas` - Implementado funcionalmente.
- ✅ `/portal/historial-medico` - Implementado funcionalmente.

#### 8.3 Facturacion e Ingresos
- Modelo `Invoice` en Prisma
- Campo `price` en `Category`
- CRUD de facturas y calculo real de ingresos en dashboard

#### 8.4 Subida de Archivos
- Integracion con almacenamiento (Supabase Storage / S3 / Cloudinary)
- UI para adjuntar examenes, radiografias, recetas al historial medico

#### 8.5 Configuracion del Sistema ✅ COMPLETADO (2026-07-03)
- ✅ **Horarios de atencion** - Tabla editable weekdays + weekend con toggle, hora apertura/cierre, validacion Zod.
- ✅ **Dias feriados** - CRUD de feriados con prevencion de fechas pasadas y deteccion de duplicados.
- ✅ **Personalizacion de marca** - Nombre de clinica, colores primario/secundario (con color picker), email remitente, texto de pie, subida de logo (PNG/JPG/SVG <= 2MB).
- ✅ **Integracion con agendamiento** - Validacion de horarios y feriados en el flujo de citas del cliente (RN-14, RN-15).
- ✅ **Integracion con PDFs** - Colores y logo de la clinica en los PDFs de historial medico y auditoria.
- ✅ **Integracion con Emails** - Colores, logo y nombre de la clinica en todos los templates de email transaccionales.
- ✅ **API publica** (`/api/v1/public/settings`) para consumo desde portal y frontend sin autenticacion admin.

#### 8.6 Reportes y Estadisticas Avanzadas
- Reporte de ingresos por periodo
- Reporte de citas por veterinario
- Estadisticas de cancelaciones/no-shows
- Exportacion de reportes a Excel/PDF

#### 8.7 Notificaciones Push y SMS
- Integracion con servicio de SMS (Twilio)
- Notificaciones push en navegador (Web Push)
- Preferencias de notificacion por usuario

#### 8.8 Recordatorios Automaticos (Cron Jobs)
- Recordatorio de citas 24h antes.
- Recordatorio de vacunas proximas a vencer.
- Follow-up post-consulta.
