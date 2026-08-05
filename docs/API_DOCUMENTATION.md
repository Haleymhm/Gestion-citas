# API de VeteriApp - Documentación Técnica

## Índice General
- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Veterinarios](#veterinarios)
- [Clientes](#clientes)
- [Mascotas](#mascotas)
- [Categorías](#categorías)
- [Citas](#citas)
- [Historial Médico](#historial-médico)
- [Dashboard](#dashboard)
- [Perfil](#perfil)
- [Logs de Auditoría](#logs-de-auditoría)
- [Regiones y Comunas](#regiones-y-comunas)
- [Configuración del Sistema](#configuración-del-sistema)
- [Configuración Pública](#configuración-pública)
- [Notas Técnicas](#notas-técnicas)

---

## Información General

### Prefijo base
Todas las rutas, salvo indicación explícita, usan el prefijo:

```
/api/v1
```

### Envoltura de respuesta

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { },
  "message": "Mensaje opcional"
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error"
}
```

### Códigos de estado HTTP
- **200:** Éxito
- **201:** Recurso creado
- **400:** Solicitud incorrecta / validación fallida
- **401:** No autorizado
- **403:** Acceso prohibido (rol sin permisos)
- **404:** Recurso no encontrado
- **500:** Error interno del servidor

### Autenticación
El sistema usa **JWT**. El token se envía mediante una **cookie `httpOnly`** llamada `auth-token` (vigencia de 24 h) o bien a través del header `Authorization: Bearer <token>`.

El modelo `proxy.ts` de Next.js valida el token en cada petición y, si es válido, inyecta los headers internos `x-user-id`, `x-user-role`, `x-user-email` y `x-user-name` para que los route handlers identifiquen al usuario.

Rutas públicas (no requieren token):
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/session`
- `POST /api/v1/auth/logout`

CORS: configurable mediante la variable de entorno `CORS_ALLOWED_ORIGINS` (lista separada por comas). Se responden los headers `Access-Control-*` con `Access-Control-Allow-Credentials: true`.

### Roles
| Rol | Descripción |
|------|-------------|
| `ADMIN` | Administrador del sistema |
| `VET` | Veterinario |
| `RECEPTIONIST` | Recepcionista |
| `CLIENT` | Cliente / dueño de mascota |

### Nota sobre paginación
Las rutas que devuelven listas con paginación (clientes, mascotas, audit-logs) usan este esquema en `data`:

```json
{
  "data": { },
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

O bien, en el caso de audit-logs, una clave `pagination`:
```json
{
  "data": [ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

---

## Autenticación

### POST `/api/v1/auth/register`
Registro de nuevos usuarios. Crea el usuario, genera el token y establece la cookie de sesión.

**Requiere:** Sin autenticación

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "CLIENT"
}
```

**Validación (Zod - `RegisterSchema`):**
```typescript
{
  email: z.string().email('Email inválido'),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT']).default('CLIENT')
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "data": {
    "user": {
      "id": "number",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string"
    }
  }
}
```

**Errores:** `400` si el email ya está registrado.

---

### POST `/api/v1/auth/login`
Acceso mediante credenciales. Devuelve el token y establece la cookie de sesión.

**Requiere:** Sin autenticación

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "data": {
    "token": "string",
    "user": {
      "id": "number",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string"
    }
  }
}
```

**Errores:** `401` si las credenciales son inválidas.

---

### GET `/api/v1/auth/session`
Verifica si existe una sesión activa y devuelve la información del token JWT.

**Requiere:** Token válido (cookie `auth-token` o `Authorization: Bearer`)

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "number",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

**Errores:** `401` si no existe sesión o el token es inválido.

---

### POST `/api/v1/auth/logout`
Cierra la sesión eliminando la cookie `auth-token`.

**Requiere:** Sin autenticación

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente",
  "data": null
}
```

---

### POST `/api/v1/auth/forgot-password`
Solicita un enlace de restablecimiento de contraseña. Genera un token con hash SHA-256, lo almacena con vigencia de **60 minutos** y envía un correo con el enlace. El payload siempre devuelve el mismo mensaje genérico por seguridad.

**Requiere:** Sin autenticación

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Si el email está registrado, recibirás un enlace para restablecer tu contraseña",
  "data": null
}
```

---

### POST `/api/v1/auth/reset-password`
Restablece la contraseña usando el token recibido por correo. Marca el token como utilizado e invalida los demás tokens pendientes del mismo usuario.

**Requiere:** Sin autenticación

**Request Body:**
```json
{
  "token": "raw-token-recibido-por-email",
  "newPassword": "NewPassword123"
}
```

**Validación:** `newPassword` mínimo 8 caracteres, con al menos una mayúscula y un número.

**Response:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión.",
  "data": null
}
```

**Errores:** `400` si el enlace es inválido, ya fue utilizado o expiró.

---

## Usuarios

### GET `/api/v1/users`
Obtiene la lista de usuarios (roles `VET`, `RECEPTIONIST` y `CLIENT`; excluye `ADMIN`).

**Requiere:** Rol ADMIN

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string",
      "createdAt": "string (ISO)"
    }
  ]
}
```

---

### POST `/api/v1/users`
Crea un nuevo usuario (staff).

**Requiere:** Rol ADMIN

**Request Body:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "Password123",
  "firstName": "María",
  "lastName": "García",
  "role": "VET"
}
```

**Validación (`CreateUserSchema`):** `role` debe ser `ADMIN`, `VET` o `RECEPTIONIST` (no `CLIENT`). La contraseña debe cumplir los requisitos de fortaleza.

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "number",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "createdAt": "string (ISO)"
  }
}
```

**Errores:** `400` si el email ya está registrado.

---

### GET `/api/v1/users/[id]`
Obtiene un usuario específico.

**Requiere:** Rol ADMIN

**Errores:** `404` si no existe.

---

### PUT `/api/v1/users/[id]`
Actualiza un usuario.

**Requiere:** Rol ADMIN

**Request Body (todos opcionales):**
```json
{
  "firstName": "string",
  "lastName": "string",
  "role": "ADMIN | VET | RECEPTIONIST | CLIENT",
  "password": "string"
}
```

**Errores:** `404` si no existe.

---

### DELETE `/api/v1/users/[id]`
Elimina un usuario.

**Requiere:** Rol ADMIN

**Response:**
```json
{ "success": true, "message": "Usuario eliminado exitosamente", "data": null }
```

**Errores:** `404` si no existe.

---

## Veterinarios

### GET `/api/v1/vets`
Obtiene la lista de usuarios con rol `VET`.

**Requiere:** Rol ADMIN, VET o RECEPTIONIST (staff)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  ]
}
```

---

## Clientes

### GET `/api/v1/clients`
Obtiene clientes con paginación. Solo usuarios con rol `CLIENT`.

**Requiere:** Rol ADMIN, VET o RECEPTIONIST (staff)

**Query Params:**
```
search:  Búsqueda por nombre, apellido, email o RUT (insensible a mayúsculas)
page:    Número de página (default: 1)
limit:   Cantidad por página (default: 10)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "number",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "rut": "string | null",
        "phone": "string | null",
        "address": "string | null",
        "regionId": "string | null",
        "comunaId": "string | null",
        "role": "CLIENT",
        "createdAt": "string (ISO)",
        "pets": [
          { "id": "number", "name": "string", "species": "string" }
        ],
        "region": { "id": "string", "name": "string" } | null,
        "comuna": { "id": "string", "name": "string" } | null
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

### POST `/api/v1/clients`
Crea un nuevo cliente (rol `CLIENT`).

**Requiere:** Rol staff

**Request Body:**
```json
{
  "email": "cliente@ejemplo.com",
  "password": "Password123",
  "firstName": "Ana",
  "lastName": "Torres",
  "rut": "12.345.678-9",
  "phone": "+56912345678",
  "address": "Av. Siempreviva 123",
  "regionId": "uuid",
  "comunaId": "uuid"
}
```

**Validación (`CreateClientSchema`):** `rut` requerido; `phone`, `address`, `regionId`, `comunaId` opcionales.

**Response (201):**
```json
{
  "success": true,
  "message": "Cliente creado exitosamente",
  "data": {
    "id": "number",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "rut": "string",
    "phone": "string | null",
    "address": "string | null",
    "regionId": "string | null",
    "comunaId": "string | null",
    "role": "CLIENT",
    "createdAt": "string (ISO)"
  }
}
```

**Errores:** `400` si el email o el RUT ya están registrados.

---

### GET `/api/v1/clients/[id]`
Obtiene un cliente con sus mascotas, región y comuna.

**Requiere:** Rol staff

**Errores:** `404` si no existe un usuario `CLIENT` con ese id.

---

### PUT `/api/v1/clients/[id]`
Actualiza un cliente.

**Requiere:** Rol staff

**Request Body (todos opcionales):**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "rut": "string",
  "phone": "string | null",
  "address": "string | null",
  "regionId": "string | null",
  "comunaId": "string | null"
}
```

---

### DELETE `/api/v1/clients/[id]`
Elimina un cliente.

**Requiere:** Rol staff

**Response:**
```json
{ "success": true, "message": "Cliente eliminado exitosamente", "data": null }
```

---

## Mascotas

### GET `/api/v1/pets`
Obtiene mascotas con paginación.

**Requiere:** Autenticación
- Rol `CLIENT`: solo ve sus propias mascotas (`ownerId` se fuerza a su id).
- Otros roles: puede filtrar por `ownerId`.

**Query Params:**
```
search:  Búsqueda por nombre (insensible a mayúsculas)
ownerId: Filtrar por dueño (solo staff)
page:    Número de página (default: 1)
limit:   Cantidad por página (default: 10)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "number",
        "name": "string",
        "species": "string",
        "breed": "string | null",
        "birthDate": "string (ISO) | null",
        "weight": "number | null",
        "sex": "MALE | FEMALE | null",
        "reproductiveStatus": "FERTILE | STERILIZED | CASTRATED | null",
        "specialCharacteristics": "string | null",
        "microchipNumber": "string | null",
        "ownerId": "number",
        "createdAt": "string (ISO)",
        "updatedAt": "string (ISO)",
        "owner": {
          "id": "number",
          "firstName": "string",
          "lastName": "string",
          "email": "string"
        }
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

### POST `/api/v1/pets`
Registra una nueva mascota.

**Requiere:** Autenticación
- Rol `CLIENT`: el dueño se asigna automáticamente al usuario actual (no envía `ownerId`).
- Rol staff: `ownerId` es requerido.

**Request Body:**
```json
{
  "name": "Firulais",
  "species": "Perro",
  "breed": "Labrador",
  "birthDate": "2020-05-15T00:00:00Z",
  "weight": 25.5,
  "sex": "MALE",
  "reproductiveStatus": "STERILIZED",
  "specialCharacteristics": "Nervioso con otros perros",
  "microchipNumber": "900012345678901",
  "ownerId": 123
}
```

**Validación (`CreatePetSchema`):** `name` y `species` requeridos; el resto opcional. El `ownerId` acepta número o string numérico.

**Response (201):** misma estrutura que `GET /pets` (con `owner`).

---

### GET `/api/v1/pets/[id]`
Obtiene una mascota con su dueño y las últimas 5 historias médicas.

**Requiere:** Autenticación
- Rol `CLIENT`: solo puede acceder a sus propias mascotas (403 en caso contrario).

**Response:**
```json
{
  "success": true,
  "data": {
    "...pet": "...",
    "owner": { "id": "number", "firstName": "string", "lastName": "string", "email": "string" },
    "medicalRecords": [
      { "id": "number", "title": "string", "publicNotes": "string", "createdAt": "string (ISO)" }
    ]
  }
}
```

---

### PUT `/api/v1/pets/[id]`
Actualiza una mascota.

**Requiere:** Autenticación (CLIENT solo sus propias mascotas)

**Request Body (todos opcionales, admite `null`):**
```json
{
  "name": "string",
  "species": "string",
  "breed": "string | null",
  "birthDate": "string (ISO) | null",
  "weight": "number | null",
  "sex": "MALE | FEMALE | null",
  "reproductiveStatus": "FERTILE | STERILIZED | CASTRATED | null",
  "specialCharacteristics": "string | null",
  "microchipNumber": "string | null"
}
```

---

### DELETE `/api/v1/pets/[id]`
Elimina una mascota.

**Requiere:** Rol staff

**Response:**
```json
{ "success": true, "message": "Mascota eliminada exitosamente", "data": null }
```

---

### GET/POST `/api/v1/pets/[id]/vaccinations`
Historial de vacunación de una mascota.

- **GET** — **Requiere:** Autenticación (CLIENT solo sus propias mascotas).
- **POST** — **Requiere:** staff (no `RECEPTIONIST`).

**POST Request Body:**
```json
{
  "vaccineName": "Rabia",
  "vaccineType": "Core",
  "administrationDate": "2024-05-01T10:00:00Z",
  "nextDoseDate": "2025-05-01T10:00:00Z",
  "lotNumber": "LOT-123",
  "manufacturer": "Laboratorio X"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Vacuna registrada exitosamente",
  "data": {
    "id": "number",
    "vaccineName": "string",
    "vaccineType": "string",
    "administrationDate": "string (ISO)",
    "nextDoseDate": "string (ISO) | null",
    "lotNumber": "string | null",
    "manufacturer": "string | null",
    "petId": "number",
    "createdById": "number",
    "createdAt": "string (ISO)"
  }
}
```

---

### GET/POST `/api/v1/pets/[id]/deworming`
Historial de desparasitación de una mascota.

- **GET** — **Requiere:** Autenticación (CLIENT solo sus propias mascotas).
- **POST** — **Requiere:** staff (no `RECEPTIONIST`).

**POST Request Body:**
```json
{
  "productName": "Endoctor",
  "type": "BOTH",
  "dosage": "1 pastilla",
  "date": "2024-06-15T10:00:00Z",
  "nextDate": "2024-09-15T10:00:00Z"
}
```

**Validación:** `type` ∈ `INTERNAL | EXTERNAL | BOTH`.

---

### GET/POST `/api/v1/pets/[id]/surgical-history`
Antecedentes quirúrgicos de una mascota.

- **GET** — **Requiere:** Autenticación (CLIENT solo sus propias mascotas).
- **POST** — **Requiere:** staff (no `RECEPTIONIST`).

**POST Request Body:**
```json
{
  "procedure": "OvarioHisterectomía",
  "date": "2023-11-10T00:00:00Z",
  "complications": "Ninguna",
  "notes": "Recuperación favorable",
  "outcomes": "Sin novedad"
}
```

---

### GET/POST `/api/v1/pets/[id]/chronic-conditions`
Condiciones crónicas de una mascota.

- **GET** — **Requiere:** Autenticación (CLIENT solo sus propias mascotas).
- **POST** — **Requiere:** staff (no `RECEPTIONIST`).

**POST Request Body:**
```json
{
  "name": "Diabetes mellitus",
  "type": "Endocrina",
  "severity": "Moderada",
  "diagnosisDate": "2024-01-15T00:00:00Z",
  "notes": "Control cada 3 meses",
  "isActive": true
}
```

---

## Categorías

### GET `/api/v1/categories`
Obtiene todas las categorías de citas (ordenadas alfabéticamente).

**Requiere:** Autenticación

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "name": "string",
      "color": "string",
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)"
    }
  ]
}
```

---

### POST `/api/v1/categories`
Crea una categoría.

**Requiere:** Rol ADMIN

**Request Body:**
```json
{
  "name": "Consulta general",
  "color": "#3b82f6"
}
```

**Response (201):**
```json
{ "success": true, "message": "Categoría creada exitosamente", "data": { "id": "uuid", "name": "string", "color": "string" } }
```

---

### GET `/api/v1/categories/[id]`
Obtiene una categoría específica.

**Requiere:** Autenticación

**Errores:** `404` si no existe.

---

### PUT `/api/v1/categories/[id]`
Actualiza una categoría.

**Requiere:** Rol ADMIN

**Request Body (opcional):**
```json
{ "name": "string", "color": "string" }
```

**Errores:** `400` si ya existe otra categoría con el mismo nombre.

---

### DELETE `/api/v1/categories/[id]`
Elimina una categoría.

**Requiere:** Rol ADMIN

**Errores:** `400` si hay citas asociadas a la categoría (no se puede eliminar).

---

## Citas

> **Nota:** Las citas ya no incluyen campos `duration`, `type` ni `ownerId`. La duración y tipo se gestionan mediante la **categoría** (`categoryId`). El estado incluye además `NO_SHOW`.

### GET `/api/v1/appointments`
Obtiene la lista de citas.

**Requiere:** Autenticación
- Rol `VET`: solo ve sus propias citas (`vetId` forzado).
- Rol `CLIENT`: solo ve citas de sus propias mascotas.

**Query Params:**
```
status:      PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
vetId:       Filtrar por veterinario
petId:       Filtrar por mascota
dateFrom:    Fecha inicio (ISO)
dateTo:      Fecha fin (ISO)
pendingOnly: 'true' para ver solo citas PENDING (si no se usa dateFrom/dateTo)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "date": "string (ISO)",
      "reason": "string",
      "status": "PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW",
      "notes": "string | null",
      "petId": "number",
      "vetId": "number | null",
      "categoryId": "string (uuid)",
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)",
      "category": { "id": "uuid", "name": "string", "color": "string" },
      "pet": {
        "id": "number",
        "name": "string",
        "...": "...",
        "owner": { "id": "number", "firstName": "string", "lastName": "string", "email": "string" }
      },
      "vet": { "id": "number", "firstName": "string", "lastName": "string", "email": "string" } | null
    }
  ]
}
```

---

### POST `/api/v1/appointments`
Crea una nueva cita.

**Requiere:** Autenticación

**Request Body:**
```json
{
  "date": "2024-12-15T10:00:00Z",
  "reason": "Control anual",
  "categoryId": "uuid-de-categoría",
  "petId": 123,
  "vetId": 456,
  "notes": "El animal muestra síntomas de ansiedad",
  "status": "CONFIRMED"
}
```

**Validación (`CreateAppointmentSchema`):** `date` (no puede ser en el pasado), `reason`, `categoryId` (uuid) y `petId` requeridos; `vetId`, `notes` y `status` opcionales.

**Reglas de negocio:**
- La fecha no puede estar en el pasado.
- Si el usuario es `CLIENT`, se valida el horario contra la configuración (`schedule`/feriados) y el estado inicial será `PENDING`.
- Si el usuario es staff, el estado por defecto es `CONFIRMED`.
- No puede haber dos citas `PENDING`/`CONFIRMED` para el mismo `vetId` en la misma fecha.
- Un `CLIENT` solo puede agendar para su propia mascota.
- Se envía un email de notificación al crear la cita.

**Response (201):** misma estructura de `GET /appointments`.

---

### GET `/api/v1/appointments/[id]`
Obtiene una cita específica con categoría, mascota (con dueño) y veterinario.

**Requiere:** Autenticación (CLIENT solo citas de sus mascotas)

---

### PUT `/api/v1/appointments/[id]`
Actualiza una cita.

**Requiere:** Rol staff

**Request Body (todos opcionales):**
```json
{
  "date": "string (ISO)",
  "reason": "string",
  "status": "PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW",
  "notes": "string | null",
  "vetId": "number | null",
  "petId": "number",
  "categoryId": "string (uuid)"
}
```

**Reglas de negocio:**
- No se puede mover la cita a una fecha pasada distinta del día actual.
- Se valida el conflicto de horario del veterinario si cambian `vetId`/`date`.
- Según el nuevo `status` se envía email de confirmación, cancelación o completado.

---

### DELETE `/api/v1/appointments/[id]`
Elimina una cita.

**Requiere:** Rol staff

**Response:**
```json
{ "success": true, "message": "Cita eliminada exitosamente", "data": null }
```

---

## Historial Médico

> **Nota:** El modelo actual usa `title`, `publicNotes`, `privateNotes` y admite signos vitales (`vitals`) y exámenes adjuntos (`exams`). No utiliza `symptoms`, `medications`, `followUpDate` ni `attachments` como en versiones anteriores.

### GET `/api/v1/medical-records`
Obtiene registros médicos.

**Requiere:** Autenticación
- Rol `CLIENT`: solo registros de sus mascotas.
- Rol `VET`: solo sus propios registros.

**Query Params:**
```
petId: Filtrar por mascota
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "date": "string (ISO)",
      "title": "string",
      "diagnosis": "string | null",
      "treatment": "string | null",
      "publicNotes": "string",
      "privateNotes": "string | null",
      "petId": "number",
      "vetId": "number",
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)",
      "pet": {
        "id": "number",
        "name": "string",
        "species": "string",
        "breed": "string | null",
        "owner": { "id": "number", "firstName": "string", "lastName": "string", "email": "string" }
      },
      "vet": { "id": "number", "firstName": "string", "lastName": "string", "email": "string" },
      "vitals": {
        "id": "number",
        "weight": "number | null",
        "temperature": "number | null",
        "heartRate": "number | null",
        "respiratoryRate": "number | null",
        "capillaryRefillTime": "string | null",
        "dehydrationPercentage": "number | null",
        "mucousMembranes": "string | null",
        "medicalRecordId": "number"
      } | null,
      "exams": [
        { "id": "number", "fileName": "string", "fileUrl": "string", "fileType": "string", "description": "string | null", "medicalRecordId": "number", "createdAt": "string (ISO)" }
      ]
    }
  ]
}
```

---

### POST `/api/v1/medical-records`
Crea un nuevo registro médico.

**Requiere:** Rol staff `ADMIN`/`VET` (no `RECEPTIONIST`)

**Request Body:**
```json
{
  "petId": 123,
  "date": "2024-12-10T14:00:00Z",
  "title": "Consulta de control",
  "diagnosis": "Otitis externa",
  "treatment": "Limpieza auricular y antibióticos",
  "publicNotes": "Paciente mejorando",
  "privateNotes": "Notas internas del veterinario",
  "vitals": {
    "weight": 25.5,
    "temperature": 38.5,
    "heartRate": 80,
    "respiratoryRate": 20,
    "capillaryRefillTime": "2s",
    "dehydrationPercentage": 5,
    "mucousMembranes": "Rosadas"
  }
}
```

**Validación (`CreateMedicalRecordSchema`):** `title` y `publicNotes` requeridos; `diagnosis`, `treatment`, `privateNotes`, `date` y `vitals` opcionales.

**Response (201):** misma estructura de `GET /medical-records`.

---

### GET `/api/v1/medical-records/[id]`
Obtiene un registro médico específico.

**Requiere:** Autenticación (CLIENT solo registros de sus mascotas)

---

### PUT `/api/v1/medical-records/[id]`
Actualiza un registro médico y sus signos vitales.

**Requiere:** staff `ADMIN`/`VET` (no `RECEPTIONIST`); un `VET` solo puede editar sus propios registros.

**Request Body (todos opcionales):**
```json
{
  "title": "string",
  "date": "string (ISO) | null",
  "diagnosis": "string | null",
  "treatment": "string | null",
  "publicNotes": "string",
  "privateNotes": "string | null",
  "vitals": { "...campos de vitals parciales..." }
}
```

---

### DELETE `/api/v1/medical-records/[id]`
Elimina un registro médico.

**Requiere:** staff `ADMIN`/`VET` (no `RECEPTIONIST`); un `VET` solo puede eliminar sus propios registros.

---

### GET/POST `/api/v1/medical-records/[id]/exams`
Exámenes adjuntos a un registro médico.

- **GET** — **Requiere:** Autenticación (CLIENT solo registros de sus mascotas).
- **POST** — **Requiere:** staff (no `RECEPTIONIST`); un `VET` solo puede adjuntar a sus propios registros.

**POST Request Body:**
```json
{
  "fileName": "analisis-sangre.pdf",
  "fileUrl": "https://.../archivo.pdf",
  "fileType": "application/pdf",
  "description": "Hemograma completo"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Examen adjuntado exitosamente",
  "data": {
    "id": "number",
    "fileName": "string",
    "fileUrl": "string",
    "fileType": "string",
    "description": "string | null",
    "medicalRecordId": "number",
    "createdAt": "string (ISO)"
  }
}
```

---

## Dashboard

### GET `/api/v1/dashboard`
Obtiene métricas para el dashboard según un rango temporal.

**Requiere:** Rol ADMIN o VET (un `CLIENT` recibe 403)

**Query Params:**
```
range: month | prev | quarter | year   (default: month)
```
- `month` → mes actual
- `prev` → mes anterior
- `quarter` → trimestre actual
- `year` → año actual

**Response:**
```json
{
  "success": true,
  "data": {
    "range": "string",
    "rangeLabel": "string",
    "generatedAt": "string (ISO)",
    "today": {
      "total": "number",
      "byStatus": {
        "PENDING": "number",
        "CONFIRMED": "number",
        "COMPLETED": "number",
        "CANCELLED": "number",
        "NO_SHOW": "number"
      }
    },
    "pets": { "active": "number", "newThisMonth": "number" },
    "revenue": { "thisMonth": 0, "lastMonth": 0, "percentChange": 0 },
    "appointmentsByStatus": {
      "PENDING": "number",
      "CONFIRMED": "number",
      "COMPLETED": "number",
      "CANCELLED": "number",
      "NO_SHOW": "number"
    },
    "speciesDistribution": [ { "species": "string", "count": "number" } ],
    "upcomingAppointments": [
      {
        "id": "number",
        "date": "string (ISO)",
        "reason": "string",
        "status": "string",
        "petId": "number",
        "petName": "string",
        "ownerName": "string",
        "vetId": "number | null",
        "vetName": "string | null",
        "categoryName": "string",
        "categoryColor": "string"
      }
    ],
    "topVets": [ { "vetId": "number", "vetName": "string", "count": "number" } ]
  }
}
```

> **Nota:** `revenue` es un placeholder (`0`) pendiente de la implementación de facturación. Para un rol `VET`, las métricas se filtran a sus propias citas.

---

## Perfil

### GET `/api/v1/profile`
Obtiene el perfil del usuario autenticado.

**Requiere:** Autenticación

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "rut": "string | null",
    "phone": "string | null",
    "address": "string | null",
    "regionId": "string | null",
    "comunaId": "string | null",
    "createdAt": "string (ISO)",
    "updatedAt": "string (ISO)",
    "region": { "id": "string", "name": "string", "code": "string" } | null,
    "comuna": { "id": "string", "name": "string", "code": "string", "regionId": "string" } | null
  }
}
```

---

### PUT `/api/v1/profile`
Actualiza el perfil del usuario autenticado.

**Requiere:** Autenticación

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string | null",
  "address": "string | null",
  "regionId": "string | null",
  "comunaId": "string | null"
}
```

**Validación (`UpdateProfileSchema`):** `firstName`, `lastName` y `email` requeridos. Se valida que el email no esté registrado por otro usuario.

---

### PUT `/api/v1/profile/password`
Cambia la contraseña del usuario autenticado.

**Requiere:** Autenticación

**Request Body:**
```json
{
  "currentPassword": "PasswordActual123",
  "newPassword": "PasswordNueva123"
}
```

**Errores:** `400` si la contraseña actual es incorrecta o si la nueva es igual a la actual.

---

## Logs de Auditoría

Los logs son inmutables y firmados (encadenados mediante `previousHash` + `signature`) para garantizar integridad.

### GET `/api/v1/audit-logs`
Obtiene logs de auditoría con paginación y filtros.

**Requiere:** Rol ADMIN

**Query Params:**
```
page:       Número de página (default: 1)
limit:      Cantidad por página (default: 20)
userId:     Filtrar por usuario
action:     CREATE | READ | UPDATE | DELETE
module:     Módulo (ej. User, Pet, Appointment, Auth, ...)
entityId:   Filtrar por entidad
startDate:  Fecha inicio (ISO o YYYY-MM-DD)
endDate:    Fecha fin (ISO o YYYY-MM-DD)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "string",
        "userId": "number",
        "userFullName": "string",
        "userEmail": "string",
        "action": "string",
        "module": "string",
        "entityId": "string",
        "entityType": "string",
        "timestamp": "string (ISO)",
        "ipAddress": "string | null",
        "details": []
      }
    ],
    "pagination": { "page": "number", "limit": "number", "total": "number", "totalPages": "number" }
  }
}
```

---

### GET `/api/v1/audit-logs/[id]/verify`
Verifica la integridad (firma) de un log de auditoría.

**Requiere:** Rol ADMIN

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "isValid": "boolean",
    "log": {
      "userId": "number",
      "userFullName": "string",
      "userEmail": "string",
      "action": "string",
      "module": "string",
      "entityId": "string",
      "entityType": "string",
      "timestamp": "string (ISO)",
      "ipAddress": "string | null",
      "details": []
    }
  }
}
```

---

### GET `/api/v1/audit-logs/export/csv`
Descarga los logs en formato **CSV**.

**Requiere:** Rol ADMIN

**Query Params:**
```
startDate:  Fecha inicio (default: hace 30 días)
endDate:    Fecha fin (default: ahora)
userId:     Filtrar por usuario
action:     Filtrar por acción
module:     Filtrar por módulo
```

**Response:** `text/csv` con `Content-Disposition: attachment` (archivo `audit-logs-YYYY-MM-DD.csv`).

---

### GET `/api/v1/audit-logs/export/pdf`
Descarga los logs en formato **PDF**.

**Requiere:** Rol ADMIN

**Query Params:** idénticos a la exportación CSV.

**Response:** `application/pdf` con `Content-Disposition: attachment` (archivo `audit-logs-YYYY-MM-DD.pdf`).

---

## Regiones y Comunas

### GET `/api/v1/regions`
Obtiene la lista de regiones.

**Requiere:** Sin autenticación (público)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "code": "string",
      "name": "string",
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)"
    }
  ]
}
```

---

### POST `/api/v1/regions`
Crea una región.

**Requiere:** Rol ADMIN

**Request Body:**
```json
{ "code": "13", "name": "Región Metropolitana" }
```

**Errores:** `400` si el código ya existe.

---

### GET `/api/v1/regions/[id]`
Obtiene una región con sus comunas.

**Requiere:** Sin autenticación (público)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "code": "string",
    "name": "string",
    "comunas": [ { "id": "string", "code": "string", "name": "string", "regionId": "string" } ]
  }
}
```

---

### PUT / DELETE `/api/v1/regions/[id]`
Actualiza / elimina una región.

**Requiere:** Rol ADMIN

**PUT Body:** `{ "code": "string", "name": "string" }` (opcionales).
**DELETE:** no se puede eliminar si tiene comunas asociadas (error `400`).

---

### GET `/api/v1/comunas`
Obtiene la lista de comunas.

**Requiere:** Sin autenticación (público)

**Query Params:**
```
regionId: Filtrar por región (opcional)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string (uuid)",
      "code": "string",
      "name": "string",
      "regionId": "string",
      "region": { "id": "string", "code": "string", "name": "string" }
    }
  ]
}
```

---

### POST `/api/v1/comunas`
Crea una comuna.

**Requiere:** Rol ADMIN

**Request Body:**
```json
{ "code": "13101", "name": "Santiago", "regionId": "uuid-de-región" }
```

**Errores:** `400` si la región no existe o el código ya existe.

---

### GET `/api/v1/comunas/[id]`
Obtiene una comuna con su región.

**Requiere:** Sin autenticación (público)

---

### PUT / DELETE `/api/v1/comunas/[id]`
Actualiza / elimina una comuna.

**Requiere:** Rol ADMIN

**PUT Body:** `{ "code": "string", "name": "string", "regionId": "string" }` (opcionales).

---

## Configuración del Sistema

Las claves de configuración (`schedule`, `branding`) se almacenan en la tabla `ClinicSetting` (par clave-valor JSON). Todos los endpoints de configuración requieren rol **ADMIN**, salvo los públicos.

### GET `/api/v1/configuracion`
Obtiene de forma consolidada horario, feriados y marca.

**Requiere:** Rol ADMIN

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "monday":    { "enabled": true, "open": "09:00", "close": "19:00" },
      "tuesday":   { "enabled": true, "open": "09:00", "close": "19:00" },
      "wednesday": { "enabled": true, "open": "09:00", "close": "19:00" },
      "thursday":  { "enabled": true, "open": "09:00", "close": "19:00" },
      "friday":    { "enabled": true, "open": "09:00", "close": "19:00" },
      "saturday":  { "enabled": true, "open": "09:00", "close": "14:00" },
      "sunday":    { "enabled": false, "open": "09:00", "close": "14:00" }
    },
    "holidays": [
      {
        "id": "number",
        "date": "string (ISO)",
        "label": "string",
        "createdById": "number",
        "createdAt": "string (ISO)",
        "createdBy": { "id": "number", "firstName": "string", "lastName": "string" }
      }
    ],
    "branding": {
      "clinicName": "string",
      "logoUrl": "string | null",
      "primaryColor": "string",
      "secondaryColor": "string",
      "footerText": "string",
      "fromEmail": "string",
      "fromName": "string"
    }
  }
}
```

### Horario

#### GET `/api/v1/configuracion/schedule`
Obtiene el horario semanal.

**Requiere:** Rol ADMIN

#### PUT `/api/v1/configuracion/schedule`
Actualiza el horario semanal.

**Requiere:** Rol ADMIN

**Request Body:** para cada día de la semana (`monday`...`sunday`):
```json
{
  "monday": { "enabled": true, "open": "08:30", "close": "17:30" },
  "tuesday": { "enabled": true, "open": "08:30", "close": "17:30" },
  "...": { }
}
```
**Validación (`UpdateScheduleSchema`):** formato hora `HH:MM`; si `enabled` es `true`, `open` debe ser anterior a `close`.

### Marca (Branding)

#### GET/PUT `/api/v1/configuracion/branding`
Obtiene / actualiza la marca de la clínica.

**Requiere:** Rol ADMIN

**PUT Request Body:**
```json
{
  "clinicName": "string (máx 100)",
  "primaryColor": "#2563eb",
  "secondaryColor": "#64748b",
  "footerText": "string (máx 200)",
  "fromEmail": "noreply@clinica.cl"
}
```
**Validación (`UpdateBrandingSchema`):** colores en formato hex `#RRGGBB`, `fromEmail` debe ser email válido.

#### POST `/api/v1/configuracion/branding/logo`
Sube un nuevo logo de la clínica.

**Requiere:** Rol ADMIN

**Tipo de contenido:** `multipart/form-data` con campo `logo`.

**Reglas:** solo `image/png`, `image/jpeg` o `image/svg+xml`; máximo **2 MB**. El archivo se almacena en `public/uploads/`.

**Response:**
```json
{
  "success": true,
  "message": "Logo subido",
  "data": { "logoUrl": "/uploads/logo-<timestamp>.png" }
}
```

### Feriados

#### GET `/api/v1/configuracion/holidays`
Obtiene todos los feriados.

**Requiere:** Rol ADMIN

#### POST `/api/v1/configuracion/holidays`
Crea un feriado.

**Requiere:** Rol ADMIN

**Request Body:**
```json
{ "date": "2025-12-25T00:00:00Z", "label": "Navidad" }
```

**Errores:** `400` si la fecha ya existe o está en el pasado.

#### DELETE `/api/v1/configuracion/holidays/[id]`
Elimina un feriado.

**Requiere:** Rol ADMIN

---

## Configuración Pública

### GET `/api/v1/public/settings`
Configuración pública para el portal de agendamiento de citas.

**Requiere:** Sin autenticación

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": { "...horario semanal..." },
    "upcomingHolidays": [
      { "id": "number", "date": "string (ISO)", "label": "string" }
    ]
  }
}
```

---

## Notas Técnicas

### Modelos y enums principales
- **Rol:** `ADMIN`, `VET`, `RECEPTIONIST`, `CLIENT`
- **Estado de cita (`AppointmentStatus`):** `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- **Sexo (`Sex`):** `MALE`, `FEMALE`
- **Estado reproductivo (`ReproductiveStatus`):** `FERTILE`, `STERILIZED`, `CASTRATED`
- **Tipo de desparasitación (`DewormingType`):** `INTERNAL`, `EXTERNAL`, `BOTH`

### Campos de fechas
Las fechas se envían y devuelven en formato string ISO 8601 (p. ej. `2024-12-15T10:00:00Z`). En peticiones se transforman a `Date` mediante Zod.

### IDs
- Las entidades `User`, `Pet`, `Appointment`, `MedicalRecord` y subentidades usan **id numérico** (autoincrement).
- Las entidades `Category`, `Region`, `Comuna`, `AuditLog` y `AuditLogDetail` usan **id string UUID**.
- `ClinicHoliday` usa **id numérico**.

### Auditoría
- Cada operación de escritura registra un `AuditLog` con `action` (`CREATE`, `READ`, `UPDATE`, `DELETE`), `module`, `entityId`, `entityType`, `ipAddress`, `previousHash` y `signature`.
- `userId` puede ser `null` conceptualmente para acciones públicas (p. ej. registro), pero el esquema lo exige; acciones sin usuario registrado no generan log.

### Correos electrónicos
Los envíos de email (cita creada, confirmada, cancelada, completada y restablecimiento de contraseña) se realizan mediante la librería `resend` y plantillas `@react-email`. El fallo del envío no bloquea la operación principal (los envíos de citas se ejecutan en segundo plano con `.catch`).

### CORS
Los endpoints API responden CORS solo para los orígenes listados en `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:8081,http://localhost:3000`).

---

**Última actualización:** 2026-08-05