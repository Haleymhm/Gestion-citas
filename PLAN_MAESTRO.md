# Documento Maestro: Software de Gestión de Citas para Veterinaria

## 1. Información General del Proyecto

| Atributo | Detalle |
| :--- | :--- |
| **Nombre del Sistema** | VetAppoint |
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
*   **RN-01:** Un usuario debe tener un rol único y obligatorio: `ADMIN`, `VET`, `RECEPTIONIST` o `CLIENT`.
*   **RN-02:** El correo electrónico de un usuario debe ser único en el sistema.
*   **RN-03:** La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula y un número.
*   **RN-04:** Solo un usuario con rol `ADMIN` puede crear nuevos usuarios con roles `ADMIN`, `VET` o `RECEPTIONIST`.
*   **RN-05:** Los clientes se registran por sí mismos a través del portal público.

### 3.2 Gestión de Mascotas
*   **RN-06:** Una mascota debe estar vinculada obligatoriamente a un único cliente (`User` con rol `CLIENT`).
*   **RN-07:** El nombre de la mascota y la especie son campos obligatorios.
*   **RN-08:** Un cliente puede tener múltiples mascotas.
*   **RN-09:** Un veterinario o un admin puede editar los datos de cualquier mascota. Un `RECEPTIONIST` solo puede editar datos existentes.

### 3.3 Agendamiento de Citas
*   **RN-10:** Una cita debe estar vinculada a una mascota, un cliente (dueño) y opcionalmente a un veterinario.
*   **RN-11:** Los estados de una cita son: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
*   **RN-12:** **Flujo Online (Clientes):** Un cliente crea una cita con estado `PENDING`. Un `RECEPTIONIST` o `ADMIN` debe cambiarla a `CONFIRMED` y asignar un veterinario para que sea oficial.
*   **RN-13:** **Flujo Offline (Staff):** Un `RECEPTIONIST` o `ADMIN` puede crear una cita directamente en estado `CONFIRMED` si el veterinario y el horario están disponibles.
*   **RN-14:** No se puede crear una cita en un horario pasado.
*   **RN-15:** No se puede crear una cita en un horario que ya está ocupado por el mismo veterinario.
*   **RN-16:** Un veterinario solo puede ver y gestionar las citas a las que está asignado.

### 3.4 Historial Médico
*   **RN-17:** Cada entrada del historial médico está vinculada a una mascota y a un veterinario (quien la creó).
*   **RN-18:** Las entradas deben tener un campo `publicNotes` (visible para el dueño) y un campo `privateNotes` (solo para `VET` y `ADMIN`).
*   **RN-19:** Un cliente solo puede ver las entradas del historial de sus propias mascotas.
*   **RN-20:** Un veterinario solo puede editar/eliminar sus propias entradas de historial.

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
  id        Int      @id @default(autoincrement())
  name      String
  species   String
  breed     String?
  birthDate DateTime?
  weight    Float?
  ownerId   Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner        User          @relation(fields: [ownerId], references: [id])
  appointments Appointment[]
  medicalRecords MedicalRecord[]
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
  id           Int      @id @default(autoincrement())
  title        String
  publicNotes  String   @db.Text
  privateNotes String?  @db.Text
  petId        Int
  vetId        Int      // Quién creó la entrada
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  pet Pet @relation(fields: [petId], references: [id])
  vet User @relation(fields: [vetId], references: [id])
}
```

---

## 5. Flujos de Módulos

### 5.1 Módulo de Autenticación
1.  Usuario accede a `/signin`.
2.  Ingresa email y contraseña.
3.  Backend verifica credenciales y genera un JWT seguro.
4.  El JWT se almacena en una cookie `HttpOnly`.
5.  El Middleware de Next.js redirige al dashboard correspondiente según el rol del usuario.

### 5.2 Módulo de Gestión de Mascotas (Admin / Recepcionista)
1.  Acceso a la página "Mascotas".
2.  Listado con tabla y búsqueda (usando componentes del template).
3.  Crear nueva mascota: se selecciona el dueño (cliente) desde un buscador.
4.  Editar / Eliminar mascota.

### 5.3 Módulo de Agendamiento de Citas (Staff)
1.  Acceso a la página "Calendario" (FullCalendar).
2.  El calendario muestra todas las citas por colores según estado.
3.  Click en un horario vacío abre un modal para crear cita (flujo rápido).
4.  Click en una cita existente abre el detalle para confirmar, reasignar o cancelar.

### 5.4 Flujo de Agendamiento Online (Portal del Cliente)
1.  Cliente inicia sesión en el portal.
2.  Selecciona una de sus mascotas.
3.  Selecciona fecha y horario disponible en el calendario público.
4.  Indica el motivo de la consulta.
5.  Se crea la cita con estado `PENDING`.
6.  Se envía un email al recepcionista/admin notificando la nueva solicitud.
7.  El staff revisa, asigna un veterinario y cambia el estado a `CONFIRMED`.
8.  El cliente recibe un email de confirmación con los detalles.

### 5.5 Módulo de Historial Médico
1.  Desde el perfil de una mascota, el veterinario accede a "Historial".
2.  Crea una nueva entrada con título, notas públicas y privadas.
3.  El cliente, al revisar el perfil de su mascota en el portal, ve solo las entradas y sus `publicNotes`.

---

## 6. Roles y Sus Módulos

| Módulo | ADMIN | VET | RECEPTIONIST | CLIENTE |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard | ✅ Completo | ✅ Sus Citas/Pacientes | ✅ Calendario General | ✅ Mis Citas |
| Gestión de Usuarios | ✅ | ❌ | ❌ | ❌ |
| Gestión de Clientes | ✅ | 👁️ Ver (sus pacientes) | ✅ CRUD | ❌ |
| Gestión de Mascotas | ✅ | ✅ CRUD (sus pacientes) | ✅ Crear/Editar | ✅ Ver sus mascotas |
| Agendamiento de Citas | ✅ CRUD + Asignar Vets | ✅ Ver/Editar (sus citas) | ✅ CRUD + Confirmar | ✅ Solicitar (Pendiente) |
| Historial Médico | ✅ Ver/Editar Todo | ✅ CRUD (sus pacientes) | ❌ | ✅ Ver Notas Públicas |
| Configuración | ✅ | ❌ | ❌ | ❌ |

---

## 7. Fases de Implementación del Desarrollo

### Fase 1: Inicialización e Integración del Template (Días 1-2)
*   Copiar y limpiar el template base en el repositorio.
*   Configurar el proyecto Next.js con Prisma y la conexión a Supabase.
*   Establecer la estructura de rutas: `(admin)`, `(portal)`, `(auth)`.
*   Instalar dependencias faltantes (jose, bcryptjs, resend).

### Fase 2: Modelado de Datos y Autenticación (Días 3-4)
*   Definir el `schema.prisma` final.
*   Ejecutar la primera migración (`prisma migrate dev`).
*   Implementar el sistema de registro y login (API Routes + JWT en cookies).
*   Desarrollar el Middleware de protección de rutas por roles.

### Fase 3: Módulos de Gestión (Días 5-8)
*   CRUD de Usuarios y Clientes.
*   CRUD de Mascotas.
*   UI con componentes del template (tablas, formularios).

### Fase 4: Módulo de Citas y Calendario (Días 9-12)
*   Integración del componente FullCalendar para el staff.
*   Implementar la lógica de creación de citas (offline y online).
*   Desarrollar el flujo de confirmación manual (`PENDING` -> `CONFIRMED`).
*   Desarrollar el portal del cliente para solicitar citas.

### Fase 5: Módulo de Historial Médico (Días 13-14)
*   Formulario de creación de entradas (con notas públicas/privadas).
*   Visualización del historial en el perfil de la mascota (staff).
*   Visualización de notas públicas para el cliente.

### Fase 6: Dashboard y Notificaciones (Días 15-16)
*   Implementar el Dashboard de estadísticas con ApexCharts.
*   Integrar el servicio de Email (Resend) para confirmaciones y recordatorios.
*   Implementar lógica de recordatorios automáticos.

### Fase 7: Testing, Pulido y Despliegue (Días 17-18)
*   Pruebas funcionales de cada flujo.
*   Corrección de bugs y optimización de rendimiento.
*   Despliegue en Vercel.
