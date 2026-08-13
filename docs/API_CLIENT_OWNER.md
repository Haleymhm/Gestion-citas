# Documentación de API para Aplicación Móvil (Perfil Owner / CLIENT)

Esta documentación reúne todos los endpoints, esquemas de validación, parámetros y respuestas necesarios para construir una aplicación móvil orientada al perfil de **Owner** (dueño de mascota / rol `CLIENT` en el backend).

---

## Índice General

1. [Información General y Protocolo de Comunicación](#1-información-general-y-protocolo-de-comunicación)
2. [Flujo de Autenticación](#2-flujo-de-autenticación)
3. [Datos Públicos de Regiones y Comunas](#3-datos-públicos-de-regiones-y-comunas)
4. [Configuración de la Clínica (Horarios y Feriados)](#4-configuración-de-la-clínica)
5. [Gestión de Perfil del Cliente](#5-gestión-de-perfil-del-cliente)
6. [Gestión de Mascotas (Mis Mascotas)](#6-gestión-de-mascotas)
7. [Fichas Clínicas e Historial Médico](#7-fichas-clínicas-e-historial-médico)
8. [Agendamiento y Gestión de Citas](#8-agendamiento-y-gestión-de-citas)
9. [Notas de Implementación para Móvil](#9-notas-de-implementación-para-móvil)

---

## 1. Información General y Protocolo de Comunicación

### Prefijo Base

Todas las peticiones deben realizarse utilizando el prefijo:

```
/api/v1
```

### Encabezado de Autenticación

El backend acepta autenticación mediante **JSON Web Tokens (JWT)**. Para la aplicación móvil, se debe enviar el token en la cabecera HTTP estándar de autorización en cada endpoint protegido:

```http
Authorization: Bearer <TU_JWT_TOKEN>
```

*(Nota: El backend también soporta y valida la cookie `auth-token` de tipo `httpOnly` para clientes web).*

### Esquema de Respuestas

**Respuesta Exitosa Estándar (200 / 201):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional de éxito"
}
```

**Respuesta de Error Estándar (400 / 401 / 403 / 404 / 500):**

```json
{
  "success": false,
  "error": "Descripción legible del error ocurrido"
}
```

---

## 2. Flujo de Autenticación

### POST `/api/v1/auth/register`

Registro de nuevos usuarios con rol `CLIENT`.

* **Autenticación requerida:** Ninguna (Público).
* **Cuerpo de la Petición (JSON):**

  ```json
  {
    "email": "cliente@ejemplo.com",
    "password": "Password123",
    "firstName": "Pedro",
    "lastName": "Molina",
    "role": "CLIENT"
  }
  ```

  *Nota:* La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y un número.
* **Respuesta Exitosa (201):**

  ```json
  {
    "success": true,
    "message": "Usuario registrado correctamente",
    "data": {
      "user": {
        "id": 102,
        "email": "cliente@ejemplo.com",
        "firstName": "Pedro",
        "lastName": "Molina",
        "role": "CLIENT"
      }
    }
  }
  ```

---

### POST `/api/v1/auth/login`

Inicio de sesión para obtener el token JWT.

* **Autenticación requerida:** Ninguna (Público).
* **Cuerpo de la Petición (JSON):**

  ```json
  {
    "email": "cliente@ejemplo.com",
    "password": "Password123"
  }
  ```

* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "message": "Sesión iniciada correctamente",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 102,
        "email": "cliente@ejemplo.com",
        "firstName": "Pedro",
        "lastName": "Molina",
        "role": "CLIENT"
      }
    }
  }
  ```

  *Acción recomendada:* Almacenar el campo `token` de forma segura (por ejemplo, en *Keychain* de iOS o *Secure Shared Preferences* de Android) para inyectarlo en el header `Authorization`.

---

### GET `/api/v1/auth/session`

Valida si el token actual sigue siendo válido y obtiene los datos básicos de la sesión activa.

* **Autenticación requerida:** Sí.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": {
      "userId": 102,
      "email": "cliente@ejemplo.com",
      "role": "CLIENT",
      "firstName": "Pedro",
      "lastName": "Molina"
    }
  }
  ```

---

### POST `/api/v1/auth/forgot-password`

Solicita un enlace para el restablecimiento de contraseña que se enviará al correo electrónico.

* **Autenticación requerida:** Ninguna.
* **Cuerpo de la Petición (JSON):**

  ```json
  {
    "email": "cliente@ejemplo.com"
  }
  ```

* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "message": "Si el email está registrado, recibirás un enlace para restablecer tu contraseña",
    "data": null
  }
  ```

---

### POST `/api/v1/auth/reset-password`

Restablece la contraseña utilizando el token temporal recibido por correo electrónico.

* **Autenticación requerida:** Ninguna.
* **Cuerpo de la Petición (JSON):**

  ```json
  {
    "token": "token-recibido-por-correo-electronico",
    "newPassword": "NewSecurePassword456"
  }
  ```

* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión.",
    "data": null
  }
  ```

---

### POST `/api/v1/auth/logout`

Invalida/Cierra la sesión actual.

* **Autenticación requerida:** Ninguna (elimina la cookie si se usa entorno híbrido).
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "message": "Sesión cerrada correctamente",
    "data": null
  }
  ```

---

## 3. Datos Públicos de Regiones y Comunas

Útiles para poblar selectores en pantallas de registro o de edición de perfil para usuarios de Chile.

### GET `/api/v1/regions`

Obtiene el listado completo de regiones de Chile.

* **Autenticación requerida:** Ninguna.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-region-1",
        "code": "13",
        "name": "Región Metropolitana de Santiago",
        "createdAt": "2026-07-08T00:00:00.000Z",
        "updatedAt": "2026-07-08T00:00:00.000Z"
      }
    ]
  }
  ```

---

### GET `/api/v1/regions/[id]`

Obtiene una región específica con la lista de sus comunas asociadas.

* **Autenticación requerida:** Ninguna.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-region-1",
      "code": "13",
      "name": "Región Metropolitana de Santiago",
      "comunas": [
        {
          "id": "uuid-comuna-1",
          "code": "13101",
          "name": "Santiago",
          "regionId": "uuid-region-1"
        }
      ]
    }
  }
  ```

---

### GET `/api/v1/comunas`

Obtiene el listado completo de comunas, con opción de filtrar por región.

* **Autenticación requerida:** Ninguna.
* **Query Params:**
  * `regionId` (Opcional): UUID de la región para listar solo sus comunas.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-comuna-1",
        "code": "13101",
        "name": "Santiago",
        "regionId": "uuid-region-1",
        "region": {
          "id": "uuid-region-1",
          "code": "13",
          "name": "Región Metropolitana de Santiago"
        }
      }
    ]
  }
  ```

---

## 4. Configuración de la Clínica

### GET `/api/v1/public/settings`

Obtiene las configuraciones de la clínica útiles para validar fechas de agendamiento (horarios y feriados).

* **Autenticación requerida:** Ninguna.
* **Respuesta Exitosa (200):**

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
      "upcomingHolidays": [
        {
          "id": 1,
          "date": "2026-12-25T00:00:00.000Z",
          "label": "Navidad"
        }
      ]
    }
  }
  ```

---

## 5. Gestión de Perfil del Cliente

### GET `/api/v1/profile`

Obtiene los detalles del perfil completo del usuario autenticado.

* **Autenticación requerida:** Sí.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": {
      "id": 102,
      "email": "cliente@ejemplo.com",
      "firstName": "Pedro",
      "lastName": "Molina",
      "role": "CLIENT",
      "rut": "12.345.678-9",
      "phone": "+56912345678",
      "address": "Av. Vitacura 1234",
      "regionId": "uuid-region-1",
      "comunaId": "uuid-comuna-1",
      "createdAt": "2026-07-08T10:00:00.000Z",
      "updatedAt": "2026-08-06T10:00:00.000Z",
      "region": {
        "id": "uuid-region-1",
        "name": "Región Metropolitana de Santiago",
        "code": "13"
      },
      "comuna": {
        "id": "uuid-comuna-1",
        "name": "Vitacura",
        "code": "13132",
        "regionId": "uuid-region-1"
      }
    }
  }
  ```

---

### PUT `/api/v1/profile`

Actualiza la información personal del cliente.

* **Autenticación requerida:** Sí.
* **Cuerpo de la Petición (JSON - todos requeridos salvo phone/address/regionId/comunaId que aceptan nulos):**

  ```json
  {
    "firstName": "Pedro Ignacio",
    "lastName": "Molina Silva",
    "email": "pedro.molina@nuevo.com",
    "phone": "+56987654321",
    "address": "Nueva Providencia 567",
    "regionId": "uuid-region-1",
    "comunaId": "uuid-comuna-2"
  }
  ```

* **Respuesta Exitosa (200):** Devuelve la misma estructura que `GET /api/v1/profile` con los datos actualizados.

---

### PUT `/api/v1/profile/password`

Permite cambiar la contraseña de acceso.

* **Autenticación requerida:** Sí.
* **Cuerpo de la Petición (JSON):**

  ```json
  {
    "currentPassword": "Password123",
    "newPassword": "NewPassword123"
  }
  ```

* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "message": "Contraseña cambiada exitosamente",
    "data": null
  }
  ```

---

## 6. Gestión de Mascotas

El sistema aísla automáticamente las consultas al ID de la sesión del cliente autenticado.

### GET `/api/v1/pets`

Devuelve la lista paginada de mascotas que pertenecen al cliente actual.

* **Autenticación requerida:** Sí.
* **Query Params:**
  * `search` (Opcional): Búsqueda por nombre de mascota.
  * `page` (Opcional, default: `1`): Número de página.
  * `limit` (Opcional, default: `10`): Resultados por página.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": {
      "data": [
        {
          "id": 45,
          "name": "Firulais",
          "species": "Perro",
          "breed": "Quiltro",
          "birthDate": "2022-03-10T00:00:00.000Z",
          "weight": 14.2,
          "sex": "MALE",
          "reproductiveStatus": "STERILIZED",
          "specialCharacteristics": "Mancha blanca en el lomo",
          "microchipNumber": "900012345678901",
          "ownerId": 102,
          "createdAt": "2026-07-10T12:00:00.000Z",
          "updatedAt": "2026-07-10T12:00:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

---

### POST `/api/v1/pets`

Registra una nueva mascota. El campo `ownerId` se asigna automáticamente en el servidor a partir del token.

* **Autenticación requerida:** Sí.
* **Cuerpo de la Petición (JSON):**

  ```json
  {
    "name": "Mimi",
    "species": "Gato",
    "breed": "Común Europeo",
    "birthDate": "2023-08-15T00:00:00.000Z",
    "weight": 3.8,
    "sex": "FEMALE",
    "reproductiveStatus": "STERILIZED",
    "specialCharacteristics": "Miedo al ruido fuerte",
    "microchipNumber": null
  }
  ```

  *Campos requeridos:* `name`, `species`. Los demás son opcionales o aceptan `null`.
* **Respuesta Exitosa (201):** Retorna el objeto de la mascota creada incluyendo el ID asignado.

---

### GET `/api/v1/pets/[id]`

Obtiene el detalle completo de una mascota en específico, con su información de dueño y los últimos 5 registros clínicos resumidos.

* **Autenticación requerida:** Sí (Retorna `403` si la mascota no pertenece al cliente logueado).
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": {
      "id": 45,
      "name": "Firulais",
      "species": "Perro",
      "breed": "Quiltro",
      "birthDate": "2022-03-10T00:00:00.000Z",
      "weight": 14.2,
      "sex": "MALE",
      "reproductiveStatus": "STERILIZED",
      "specialCharacteristics": "Mancha blanca en el lomo",
      "microchipNumber": "900012345678901",
      "ownerId": 102,
      "createdAt": "2026-07-10T12:00:00.000Z",
      "updatedAt": "2026-07-10T12:00:00.000Z",
      "owner": {
        "id": 102,
        "firstName": "Pedro Ignacio",
        "lastName": "Molina Silva",
        "email": "pedro.molina@nuevo.com"
      },
      "medicalRecords": [
        {
          "id": 88,
          "title": "Control Preventivo Anual",
          "publicNotes": "Estado de salud óptimo, mascota con peso ideal.",
          "createdAt": "2026-07-20T14:30:00.000Z"
        }
      ]
    }
  }
  ```

---

### PUT `/api/v1/pets/[id]`

Actualiza los datos de la mascota especificada.

* **Autenticación requerida:** Sí (Solo para mascotas propias).
* **Cuerpo de la Petición (JSON - todos los campos son opcionales):**

  ```json
  {
    "name": "Firulais II",
    "weight": 15.1,
    "reproductiveStatus": "STERILIZED",
    "specialCharacteristics": "Leve cojera en pata trasera izquierda por golpe reciente"
  }
  ```

* **Respuesta Exitosa (200):** Retorna el objeto actualizado de la mascota.

---

## 7. Fichas Clínicas e Historial Médico

El backend proporciona endpoints específicos para el desglose del historial médico por mascota.

### GET `/api/v1/pets/[id]/vaccinations`

Historial de vacunas de la mascota.

* **Autenticación requerida:** Sí (solo propias).
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 5,
        "vaccineName": "Antirrábica",
        "vaccineType": "Core",
        "administrationDate": "2026-05-10T09:00:00.000Z",
        "nextDoseDate": "2027-05-10T09:00:00.000Z",
        "lotNumber": "RAB-882",
        "manufacturer": "SanoVet",
        "petId": 45,
        "createdAt": "2026-05-10T09:30:00.000Z"
      }
    ]
  }
  ```

---

### GET `/api/v1/pets/[id]/deworming`

Historial de desparasitaciones de la mascota.

* **Autenticación requerida:** Sí (solo propias).
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 12,
        "productName": "Endoguard",
        "type": "INTERNAL",
        "dosage": "1.5 tabletas",
        "date": "2026-06-15T10:00:00.000Z",
        "nextDate": "2026-09-15T10:00:00.000Z",
        "petId": 45,
        "createdAt": "2026-06-15T10:05:00.000Z"
      }
    ]
  }
  ```

---

### GET `/api/v1/pets/[id]/surgical-history`

Antecedentes quirúrgicos de la mascota.

* **Autenticación requerida:** Sí (solo propias).
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "procedure": "Castración",
        "date": "2023-11-20T00:00:00.000Z",
        "complications": "Ninguna",
        "notes": "Recuperación rápida y limpia en casa.",
        "outcomes": "Éxito",
        "petId": 45,
        "createdAt": "2023-11-20T17:00:00.000Z"
      }
    ]
  }
  ```

---

### GET `/api/v1/pets/[id]/chronic-conditions`

Condiciones o patologías crónicas de la mascota.

* **Autenticación requerida:** Sí (solo propias).
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Diabetes Mellitus",
        "type": "Endocrina",
        "severity": "Moderada",
        "diagnosisDate": "2025-01-10T00:00:00.000Z",
        "notes": "Requiere inyección de insulina NPH diaria.",
        "isActive": true,
        "petId": 45,
        "createdAt": "2025-01-10T12:00:00.000Z"
      }
    ]
  }
  ```

---

### GET `/api/v1/medical-records`

Listado de consultas/registros médicos asociados a las mascotas del cliente.

* **Autenticación requerida:** Sí.
* **Query Params:**
  * `petId` (Requerido): ID de la mascota para filtrar.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 88,
        "date": "2026-07-20T14:30:00.000Z",
        "title": "Control Preventivo Anual",
        "diagnosis": "Sano",
        "treatment": "Ninguno",
        "publicNotes": "Estado de salud óptimo, mascota con peso ideal.",
        "privateNotes": null, 
        "petId": 45,
        "vetId": 4,
        "createdAt": "2026-07-20T14:30:00.000Z",
        "updatedAt": "2026-07-20T15:00:00.000Z",
        "pet": {
          "id": 45,
          "name": "Firulais",
          "species": "Perro",
          "breed": "Quiltro"
        },
        "vet": {
          "id": 4,
          "firstName": "Camila",
          "lastName": "Reyes",
          "email": "creyes@clinica.cl"
        },
        "vitals": {
          "id": 34,
          "weight": 14.2,
          "temperature": 38.6,
          "heartRate": 92,
          "respiratoryRate": 24,
          "capillaryRefillTime": "1s",
          "dehydrationPercentage": 0,
          "mucousMembranes": "Rosadas",
          "medicalRecordId": 88
        },
        "exams": []
      }
    ]
  }
  ```

  *Nota sobre Privacidad:* El campo `privateNotes` siempre vendrá como `null` o estará omitido para el rol `CLIENT`. Solo las `publicNotes` son accesibles.

---

### GET `/api/v1/medical-records/[id]`

Detalle de una consulta médica específica.

* **Autenticación requerida:** Sí (solo de mascotas propias).
* **Respuesta Exitosa (200):** Devuelve el objeto del registro médico individual con el mismo formato que el listado de arriba.

---

### GET `/api/v1/medical-records/[id]/exams`

Listado de exámenes adjuntos (recetas, PDFs, imágenes de radiografías) para una consulta en particular.

* **Autenticación requerida:** Sí.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 15,
        "fileName": "radiografia_torax.pdf",
        "fileUrl": "https://storage.clinica.cl/uploads/exams/uuid-archivo.pdf",
        "fileType": "application/pdf",
        "description": "Placa de tórax AP y Lateral",
        "medicalRecordId": 88,
        "createdAt": "2026-07-20T14:50:00.000Z"
      }
    ]
  }
  ```

---

## 8. Agendamiento y Gestión de Citas

### GET `/api/v1/categories`

Obtiene las categorías disponibles de la veterinaria (vacunas, consulta general, urgencias, etc.) con sus colores de UI asignados.

* **Autenticación requerida:** Sí.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-categoria-1",
        "name": "Consulta General",
        "color": "#3b82f6",
        "createdAt": "2026-07-08T00:00:00.000Z",
        "updatedAt": "2026-07-08T00:00:00.000Z"
      }
    ]
  }
  ```

---

### GET `/api/v1/appointments`

Obtiene las citas programadas para las mascotas del cliente.

* **Autenticación requerida:** Sí.
* **Query Params:**
  * `status` (Opcional): Filtrar por estado (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
  * `petId` (Opcional): Filtrar por una mascota específica.
  * `dateFrom` (Opcional): Fecha mínima en formato ISO 8601.
  * `dateTo` (Opcional): Fecha máxima en formato ISO 8601.
* **Respuesta Exitosa (200):**

  ```json
  {
    "success": true,
    "data": [
      {
        "id": 204,
        "date": "2026-08-15T10:30:00.000Z",
        "reason": "Control por vacuna",
        "status": "PENDING",
        "notes": "Nervioso con gatos",
        "petId": 45,
        "vetId": 4,
        "categoryId": "uuid-categoria-1",
        "createdAt": "2026-08-06T10:00:00.000Z",
        "updatedAt": "2026-08-06T10:00:00.000Z",
        "category": {
          "id": "uuid-categoria-1",
          "name": "Consulta General",
          "color": "#3b82f6"
        },
        "pet": {
          "id": 45,
          "name": "Firulais",
          "species": "Perro",
          "owner": {
            "id": 102,
            "firstName": "Pedro Ignacio",
            "lastName": "Molina Silva",
            "email": "pedro.molina@nuevo.com"
          }
        },
        "vet": {
          "id": 4,
          "firstName": "Camila",
          "lastName": "Reyes",
          "email": "creyes@clinica.cl"
        }
      }
    ]
  }
  ```

---

### POST `/api/v1/appointments`

Solicita/Crea una cita para una mascota.

* **Autenticación requerida:** Sí.
* **Cuerpo de la Petición (JSON):**

  ```json
  {
    "date": "2026-08-15T10:30:00.000Z",
    "reason": "Consulta por decaimiento y falta de apetito",
    "categoryId": "uuid-categoria-1",
    "petId": 45,
    "vetId": 4,
    "notes": "Ha vomitado una vez en la mañana."
  }
  ```

  *Campos requeridos:* `date`, `reason`, `categoryId`, `petId`. El campo `vetId` (veterinario preferido) y `notes` son opcionales.
* **Reglas de Negocio en la creación:**
  1. La fecha no puede ser en el pasado.
  2. Al ser solicitada por un `CLIENT`, el estado inicial por defecto será siempre `PENDING` (Pendiente de confirmación por la clínica).
  3. Solo se puede agendar si la fecha está dentro del horario semanal disponible y no coincide con feriados registrados (ver `/api/v1/public/settings`).
  4. No puede haber conflicto de horarios (citas duplicadas para el mismo veterinario a la misma hora).
  5. Se enviará una notificación automática por correo tanto al cliente como al equipo administrativo.
* **Respuesta Exitosa (201):** Devuelve la misma estructura que `GET /api/v1/appointments/[id]`.

---

### GET `/api/v1/appointments/[id]`

Obtiene los detalles de una cita específica.

* **Autenticación requerida:** Sí (solo propias).
* **Respuesta Exitosa (200):** Devuelve el objeto de la cita individual.

---

## 9. Notas de Implementación para Móvil

### Manejo de Fechas y Zona Horaria

* Las fechas viajan a través de la API en formato string ISO 8601 (p. ej., `2026-08-15T10:30:00.000Z`).
* Asegúrate de parsear estas cadenas a la zona horaria del dispositivo móvil antes de mostrarlas en la UI y de transformarlas a formato UTC (`Z`) al agendar citas.

### Generación de Reportes PDF

* El backend no genera un endpoint API para la descarga directa del PDF del historial médico.
* La aplicación Web genera el PDF en el cliente usando las librerías `jsPDF` y `jspdf-autotable` con el contenido del JSON del historial.
* **Para el móvil:** Se sugerre recrear la visualización del PDF en local en la App a partir de los datos JSON que proporcionan los endpoints del historial médico (`GET /api/v1/pets/[id]/vaccinations`, etc.) o bien renderizar una vista HTML optimizada que el usuario pueda imprimir/compartir nativamente.

### Persistencia y Sesión

* La API requiere autenticación por token en la cabecera `Authorization`.
* Si la sesión expira (los tokens JWT tienen una vigencia parametrizada de 24 horas por defecto), la API responderá con estado HTTP `401 Unauthorized`.
* Implementa un *interceptor* en tu cliente HTTP en el móvil (como Axios o Retrofit) para capturar el código `401` y redirigir al usuario automáticamente al flujo de Login.

---

*Última actualización de esta guía:* 2026-08-06
