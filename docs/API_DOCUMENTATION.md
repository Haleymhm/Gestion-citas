# API de VeteriApp - Documentación Técnica

## Índice General
- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Clientes](#clientes)
- [Mascotas](#mascotas)
- [Citas](#citas)
- [Categorías de Citas](#categorías-de-citas)
- [Historial Médico](#historial-médico)
- [Configuración del Sistema](#configuración-del-sistema)
- [Preferencias de Comunicación](#preferencias-de-comunicación)
- [Email](#email)
- [Logs de Auditoría](#logs-de-auditoría)
- [Dashboard y Estadísticas](#dashboard-y-estadísticas)
- [Preferencias de Notificación](#preferencias-de-notificación)

---

## Autenticación

### POST `/api/auth/register`
Registro de nuevos usuarios en el sistema.

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

**Validación (Zod):**
```typescript
{
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT']).default('CLIENT')
}
```

**Response:**
```json
{
  "success": true,
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

### POST `/api/auth/login`
Acceso al sistema mediante credenciales.

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

### GET `/api/auth/session`
Verifica si existe una sesión activa y devuelve los datos del usuario.

**Requiere:** Cookie de sesión JWT válida

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "number", 
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string"
  }
}
```

### POST `/api/auth/logout`
Cierra la sesión del usuario actual.

**Requiere:** Autenticación

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

## Usuarios

### GET `/api/v1/users`
Obtiene la lista de usuarios del sistema.

**Requiere:** Rol ADMIN, VET o RECEPTIONIST

**Query Params:**
```
page:    Número de página (default: 1)
limit:   Cantidad por página (default: 10)
role:    Filtrar por rol (opcional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "number",
        "email": "string",
        "firstName": "string", 
        "lastName": "string",
        "role": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number", 
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

### POST `/api/v1/users`
Crea un nuevo usuario en el sistema.

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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "email": "nuevo@ejemplo.com",
    "firstName": "María",
    "lastName": "García",
    "role": "VET"
  }
}
```

### GET `/api/v1/users/[id]`
Obtiene un usuario específico.

**Requiere:** Autenticación

---

## Clientes

### GET `/api/v1/clients`
Obtiene la lista de clientes.

**Requiere:** Rol ADMIN, VET o RECEPTIONIST

**Query Params:**
```
page:       Número de página
limit:      Cantidad por página
search:     Búsqueda por nombre o email
hasPet:     Filtrar por si tienen mascota (true/false)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "number",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "phone": "string | null",
        "address": "string | null",
        "role": "string",
        "createdAt": "string",
        "pets": ["Pet[]"]
      }
    ],
    "pagination": { ... }
  }
}
```

### GET `/api/v1/clients/search`
Busca clientes por nombre, email o teléfono.

---

## Mascotas

### GET `/api/v1/pets`
Obtiene la lista de mascotas.

**Requiere:** Rol ADMIN, VET o RECEPTIONIST

**Query Params:**
```
page:     Número de página (default: 1)
limit:    Cantidad por página (default: 10)

ownerId:  Filtrar por dueño
species:  Filtrar por especie
status:   Filtrar por estado (ACTIVE, INACTIVE)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "id": "number",
        "name": "string",
        "species": "string",
        "breed": "string",
        "birthDate": "string (ISO)",
        "weight": "number | null",
        "gender": "MALE | FEMALE",
        "color": "string | null",
        "microchip": "string | null",
        "medicalNotes": "string | null",
        "status": "ACTIVE | INACTIVE",
        "ownerId": "number",
        "owner": {
          "id": "number",
          "firstName": "string",
          "lastName": "string",
          "email": "string"
        },
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

### POST `/api/v1/pets`
Registra una nueva mascota.

**Requiere:** Autenticación

**Request Body:**
```json
{
  "name": "Firulais",
  "species": "Perro",
  "breed": "Labrador",
  "birthDate": "2020-05-15",
  "weight": 25.5,
  "gender": "MALE",
  "color": "Dorado",
  "microchip": "900012345678901",
  "ownerId": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "name": "Firulais",
    "species": "Perro",
    ...
  }
}
```

### GET `/api/v1/pets/[id]`
Obtiene una mascota específica con su historial.

### PUT `/api/v1/pets/[id]`
Actualiza los datos de una mascota.

### DELETE `/api/v1/pets/[id]`
Elimina una mascota del sistema.

---

## Citas

### GET `/api/v1/appointments`
Obtiene la lista de citas.

**Requiere:** Autenticación

**Query Params:**
```
page:          Número de página
limit:         Cantidad por página
fromDate:      Fecha inicio (ISO)
toDate:        Fecha fin (ISO)
status:        PENDING | CONFIRMED | COMPLETED | CANCELLED
petId:         Filtrar por mascota
clientId:      Filtrar por cliente
veterinarianId: Filtrar por veterinario
type:          Consulta | Cirugía | Vacunación | Emergencia
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "number",
        "date": "string (ISO)",
        "duration": "number (minutos)",
        "status": "PENDING | CONFIRMED | COMPLETED | CANCELLED",
        "type": "Consulta | Cirugía | Vacunación | Emergencia",
        "reason": "string | null",
        "notes": "string | null",
        "petId": "number",
        "pet": {
          "id": "number",
          "name": "string",
          "species": "string"
        },
        "ownerId": "number",
        "owner": {
          "id": "number",
          "firstName": "string",
          "lastName": "string",
          "email": "string",
          "phone": "string"
        },
        "veterinarianId": "number | null",
        "veterinarian": {
          "id": "number",
          "firstName": "string",
          "lastName": "string"
        },
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { ... }
  }
}
```

### POST `/api/v1/appointments`
Crea una nueva cita veterinaria.

**Request Body:**
```json
{
  "date": "2024-12-15T10:00:00Z",
  "duration": 30,
  "petId": 123,
  "ownerId": 456,
  "reason": "Control anual",
  "type": "Consulta",
  "notes": "El animal muestra síntomas de ansiedad"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "date": "2024-12-15T10:00:00Z",
    "status": "PENDING",
    ...
  }
}
```

### GET `/api/v1/appointments/[id]`
Obtiene una cita específica.

### PUT `/api/v1/appointments/[id]`
Actualiza una cita.

### DELETE `/api/v1/appointments/[id]`
Cancela o elimina una cita.

### POST `/api/v1/appointments/[id]/confirm`
Confirma una cita pendiente.

### POST `/api/v1/appointments/[id]/complete`
Marca una cita como completada.

---

## Categorías de Citas

### GET `/api/v1/appointment-categories`
Obtiene las categorías disponibles para citas.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "name": "string",
      "description": "string | null",
      "color": "string",
      "duration": "number",
      "createdAt": "string"
    }
  ]
}
```

---

## Historial Médico

### GET `/api/v1/medical-records`
Obtiene registros médicos.

**Requiere:** Rol ADMIN o VET

**Query Params:**
```
page:       Número de página
limit:      Cantidad por página
petId:      Filtrar por mascota
fromDate:   Fecha inicio
toDate:     Fecha fin
```

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "number",
        "date": "string (ISO)",
        "petId": "number",
        "pet": {
          "id": "number",
          "name": "string",
          "species": "string"
        },
        "veterinarianId": "number",
        "veterinarian": {
          "id": "number",
          "firstName": "string",
          "lastName": "string"
        },
        "diagnosis": "string | null",
        "symptoms": "string | null",
        "treatment": "string | null",
        "medications": "string | null",
        "notes": "string | null",
        "followUpDate": "string | null (ISO)",
        "nextAppointmentId": "number | null",
        "attachments": ["Attachment[]"],
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { ... }
  }
}
```

### POST `/api/v1/medical-records`
Crea un nuevo registro médico.

**Request Body:**
```json
{
  "petId": 123,
  "date": "2024-12-10T14:00:00Z",
  "diagnosis": "Otitis externa",
  "symptoms": "Dolor de oído, sacudidas de cabeza",
  "treatment": "Limpieza auricular y antibióticos",
  "medications": "Otodex, aplicar 3 gotas cada 12h",
  "notes": "Revisar en 7 días",
  "followUpDate": "2024-12-17T14:00:00Z"
}
```

### GET `/api/v1/medical-records/[id]`
Obtiene un registro médico específico.

### PUT `/api/v1/medical-records/[id]`
Actualiza un registro médico.

### DELETE `/api/v1/medical-records/[id]`
Elimina un registro médico.

---

## Configuración del Sistema

### GET `/api/v1/settings`
Obtiene la configuración general del sistema.

**Requiere:** Rol ADMIN

**Response:**
```json
{
  "success": true,
  "data": {
    "clinicName": "string",
    "address": "string | null",
    "phone": "string | null",
    "email": "string | null",
    "schedule": {
      "monday": { "open": "08:00", "close": "18:00" },
      "tuesday": { "open": "08:00", "close": "18:00" },
      ...
    },
    "timezone": "America/Santiago",
    "currency": "CLP"
  }
}
```

### PUT `/api/v1/settings`
Actualiza la configuración general.

### GET `/api/v1/settings/schedule`
Obtiene el horario de atención semanal.

### PUT `/api/v1/settings/schedule`
Actualiza el horario de atención.

---

## Preferencias de Comunicación

### GET `/api/v1/communication-preferences`
Obtiene las preferencias de comunicación del usuario actual.

**Response:**
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "smsNotifications": false,
    "reminderDays": 1,
    "marketingEmails": false,
    "language": "es"
  }
}
```

### PUT `/api/v1/communication-preferences`
Actualiza las preferencias de comunicación.

---

## Email

### POST `/api/v1/email/send`
Envía un correo electrónico.

**Requiere:** Rol ADMIN

**Request Body:**
```json
{
  "to": "destinatario@ejemplo.com",
  "subject": "Título del correo",
  "body": "Contenido del mensaje",
  "template": "appointment-reminder | welcome | custom"
}
```

### POST `/api/v1/email/send-reminders`
Envía recordatorios automáticos de citas.

---

## Logs de Auditoría

### GET `/api/v1/audit-logs`
Obtiene los logs de auditoría del sistema.

**Requiere:** Rol ADMIN

**Query Params:**
```
page:         Número de página
limit:        Cantidad por página
fromDate:     Fecha inicio
toDate:       Fecha fin
userId:       Filtrar por usuario
action:       CREATE | READ | UPDATE | DELETE | LOGIN | LOGOUT
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "number",
        "userId": "number",
        "user": {
          "firstName": "string",
          "lastName": "string",
          "email": "string"
        },
        "action": "CREATE | READ | UPDATE | DELETE",
        "entity": "string (tabla afectada)",
        "entityId": "number | null",
        "details": "string (JSON con datos relevantes)",
        "ipAddress": "string | null",
        "userAgent": "string | null",
        "createdAt": "string (ISO)"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## Dashboard y Estadísticas

### GET `/api/v1/dashboard`
Obtiene estadísticas para el dashboard principal.

**Requiere:** Rol ADMIN o VET

**Response:**
```json
{
  "success": true,
  "data": {
    "appointmentsToday": "number",
    "appointmentsWeek": "number",
    "appointmentsMonth": "number",
    "completedAppointments": "number",
    "cancelledAppointments": "number",
    "pendingAppointments": "number",
    "totalClients": "number",
    "totalPets": "number",
    "recentActivities": ["Activity[]"]
  }
}
```

### GET `/api/v1/dashboard/appointments`
Obtiene citas del periodo actual con estadísticas.

### GET `/api/v1/dashboard/statistics`
Obtiene estadísticas generales.

---

## Preferencias de Notificación

### GET `/api/v1/notification-preferences`
Obtiene las preferencias de notificación del usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "appointmentReminders": true,
    "appointmentCreated": true,
    "appointmentCancelled": true,
    "systemNotifications": true
  }
}
```

### PUT `/api/v1/notification-preferences`
Actualiza las preferencias de notificación.

---

## Notas Técnicas

### Tipos de Respuesta Comunes

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error"
}
```

### Códigos de Estado HTTP
- **200:** Éxito
- **201:** Creado
- **400:** Solicitud incorrecta
- **401:** No autorizado
- **403:** Acceso prohibido
- **404:** No encontrado
- **500:** Error del servidor

---

**Última actualización:** 2024-12-28 22:45