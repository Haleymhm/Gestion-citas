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

## 7. Fases de Implementación del Desarrollo

### Fase 1: Inicialización e Integración del Template (Días 1-2)

* Copiar y limpiar el template base en el repositorio.
* Configurar el proyecto Next.js con Prisma y la conexión a Supabase.
* Establecer la estructura de rutas: `(admin)`, `(portal)`, `(auth)`.
* Instalar dependencias faltantes (jose, bcryptjs, resend).

### Fase 2: Modelado de Datos y Autenticación (Días 3-4)

* Definir el `schema.prisma` final.
* Ejecutar la primera migración (`prisma migrate dev`).
* Implementar el sistema de registro y login (API Routes + JWT en cookies).
* Desarrollar el Middleware de protección de rutas por roles.

### Fase 3: Módulos de Gestión (Días 5-8)

* CRUD de Usuarios y Clientes.
* CRUD de Mascotas.
* UI con componentes del template (tablas, formularios).

### Fase 4: Módulo de Citas y Calendario (Días 9-12)

* Integración del componente FullCalendar para el staff.
* Implementar la lógica de creación de citas (offline y online).
* Desarrollar el flujo de confirmación manual (`PENDING` -> `CONFIRMED`).
* Desarrollar el portal del cliente para solicitar citas.

### Fase 5: Módulo de Historial Médico (Días 13-16) ✅ COMPLETADA

**Implementación completada (2026-06-09):**

* **Modelos de datos (Prisma):**
  * Nuevo enum `DewormingType` (INTERNAL, EXTERNAL, BOTH).
  * Modelo `VitalSigns` para constantes fisiológicas (peso, temperatura, FC, FR, etc.).
  * Modelo `ExamAttachment` para adjuntos de exámenes (recetas, radiografías).
  * Modelo `Vaccination` con campos para tipo de vacuna, fechas y fabricante.
  * Modelo `Deworming` con tipo de parásito y producto.
  * Modelo `SurgicalHistory` para antecedentes quirúrgicos.
  * Modelo `ChronicCondition` para alergias y patologías crónicas.
  * Actualizado `MedicalRecord` con campos `date`, `diagnosis`, `treatment` y relaciones.

* **API Routes:**
  * `GET/POST /api/v1/medical-records` - CRUD de atenciones.
  * `GET/PUT/DELETE /api/v1/medical-records/[id]` - Gestión individual.
  * `GET/POST /api/v1/medical-records/[id]/exams` - Adjuntos.
  * `GET/POST /api/v1/pets/[id]/vaccinations` - Vacunas.
  * `GET/POST /api/v1/pets/[id]/deworming` - Desparasitación.
  * `GET/POST /api/v1/pets/[id]/surgical-history` - Quirúrgicos.
  * `GET/POST /api/v1/pets/[id]/chronic-conditions` - Alergias/Patologías.

* **Frontend Admin (`/historial-medico`):**
  * Selector de mascota.
  * Tabs: Resumen, Vacunas, Desparasitación, Quirúrgicos, Consultas, Alergias/Patologías.
  * Dashboard con estadísticas visuales por categoría.
  * Formularios modales para registrar cada tipo de dato.
  * Vista detallada de consultas con constantes fisiológicas y notas.

* **Frontend Portal Cliente (`/portal/historial-medico`):**
  * Selector de mascota del cliente.
  * Vista simplificada con tabs por categoría.
  * Solo notas públicas visibles para el cliente.

### Fase 6: Dashboard y Notificaciones (Días 15-16)

* Implementar el Dashboard de estadísticas con ApexCharts.
* Integrar el servicio de Email (Resend) para confirmaciones y recordatorios.
* Implementar lógica de recordatorios automáticos.

### Fase 7: Testing, Pulido y Despliegue (Días 17-18)

* Pruebas funcionales de cada flujo.
* Corrección de bugs y optimización de rendimiento.
* Despliegue en Vercel.
