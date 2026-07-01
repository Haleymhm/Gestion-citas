# Plan de Integración: Servicio de Email con Resend

## 1. Contexto del Proyecto

**Proyecto:** VeteriApp - Sistema de Gestión de Citas para Clínicas Veterinarias
**Stack:** Next.js 16 (App Router), TypeScript, Prisma, PostgreSQL (Supabase Neon)

### Estado Actual
- ✅ `resend` v6.12.4 instalado
- ✅ `RESEND_API_KEY` configurado en `.env`
- ❌ Sin implementación de envío de emails

### Promesa UI Existente
En `src/app/portal/agendar-citas/page.tsx` (línea 129):
> "Cita solicitada exitosamente. Recibirá un email cuando sea confirmada."

Esta funcionalidad **no está implementada**.

---

## 2. Objetivo

Implementar notificaciones por email para todas las transiciones de estado de citas:
- **PENDING** (solicitud creada)
- **CONFIRMED** (confirmada por staff)
- **CANCELLED** (cancelada)
- **COMPLETED** (completada)

---

## 3. Arquitectura Propuesta

```
src/
├── lib/email/
│   ├── index.ts                    # Cliente Resend + funciones de envío
│   └── templates/
│       ├── base.layout.tsx         # Layout HTML común (header/footer)
│       ├── appointment-created.tsx # Email: Solicitud recibida
│       ├── appointment-confirmed.tsx
│       ├── appointment-cancelled.tsx
│       └── appointment-completed.tsx
├── app/api/v1/appointments/
│   ├── route.ts                    # POST: Email al crear cita (PENDING)
│   └── [id]/route.ts               # PUT: Email al actualizar estado
```

---

## 4. Dependencias a Instalar

```bash
npm install @react-email/components @react-email/render
```

---

## 5. Template Engine: React Email

Se usará **React Email** por:
- Templates editables como componentes React
- Componentes pre-construidos (Button, Text, Image, etc.)
- Rendering a HTML compatible con emails
- Estilos inline optimizados para clientes de email

---

## 6. Plan de Implementación (Paso a Paso)

### Paso 1: Instalar Dependencias

```bash
npm install @react-email/components @react-email/render
```

### Paso 2: Crear Servicio de Email

**Archivo:** `src/lib/email/index.ts`

```typescript
// Configuración del cliente Resend
// Funciones de envío para cada tipo de notificación
// Renderizado de templates React Email a HTML
```

### Paso 3: Crear Template Base

**Archivo:** `src/lib/email/templates/base.layout.tsx`

Componentes:
- Header con logo de la clínica
- Contenido dinámico
- Footer con información de contacto

### Paso 4: Crear Templates de Citas

| Archivo | Estado | Asunto |
|---------|--------|--------|
| `appointment-created.tsx` | PENDING | "Cita Recibida - #{id}" |
| `appointment-confirmed.tsx` | CONFIRMED | "Cita Confirmada - #{id}" |
| `appointment-cancelled.tsx` | CANCELLED | "Cita Cancelada - #{id}" |
| `appointment-completed.tsx` | COMPLETED | "Cita Completada - #{id}" |

### Paso 5: Integrar en Creación de Citas

**Archivo:** `src/app/api/v1/appointments/route.ts`

```typescript
// POST (crear cita)
// 1. Crear cita en base de datos
// 2. Enviar email de "solicitud recibida" al cliente
```

### Paso 6: Integrar en Actualización de Citas

**Archivo:** `src/app/api/v1/appointments/[id]/route.ts`

```typescript
// PUT (actualizar estado)
// 1. Obtener cita con datos relacionados (pet, owner, vet, category)
// 2. Detectar cambio de estado
// 3. Enviar email correspondiente al nuevo estado
```

### Paso 7: Configurar Dominio de Pruebas

Para desarrollo, usar emails de prueba de Resend:
- Destinatarios de prueba configurados en `RESEND_TEST_EMAILS`
- Dominio `@resend.dev` para testing sin límite

### Paso 8: Testing y Verificación

1. Crear una cita desde el portal → Verificar email PENDING
2. Confirmar desde admin → Verificar email CONFIRMED
3. Cancelar cita → Verificar email CANCELLED
4. Completar cita → Verificar email COMPLETED

---

## 7. Datos Disponibles para Emails

```typescript
interface AppointmentEmailData {
  id: number;
  date: Date;
  reason: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  pet: {
    name: string;
    owner: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  vet: {
    firstName: string;
    lastName: string;
  } | null;
  category: {
    name: string;
    color: string;
  };
}
```

---

## 8. Flujo de Notificaciones

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE CREA CITA                         │
│                       (POST /appointments)                   │
│                           ↓                                  │
│              Email: "Solicitud Recibida"                     │
│              Estado: PENDING                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STAFF CONFIRMA                           │
│               (PUT /appointments/:id)                       │
│              Estado: PENDING → CONFIRMED                     │
│                           ↓                                  │
│              Email: "Cita Confirmada"                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
┌───────────────────────┐   ┌───────────────────────┐
│   COMPLETED           │   │     CANCELLED         │
│  Email: Completada    │   │  Email: Cancelada     │
└───────────────────────┘   └───────────────────────┘
```

---

## 9. Archivos a Modificar/Crear

| Acción | Archivo |
|--------|---------|
| CREAR | `src/lib/email/index.ts` |
| CREAR | `src/lib/email/templates/base.layout.tsx` |
| CREAR | `src/lib/email/templates/appointment-created.tsx` |
| CREAR | `src/lib/email/templates/appointment-confirmed.tsx` |
| CREAR | `src/lib/email/templates/appointment-cancelled.tsx` |
| CREAR | `src/lib/email/templates/appointment-completed.tsx` |
| MODIFICAR | `package.json` (dependencias) |
| MODIFICAR | `src/app/api/v1/appointments/route.ts` |
| MODIFICAR | `src/app/api/v1/appointments/[id]/route.ts` |

---

## 10. Consideraciones de Diseño

### Requisitos para Templates de Email
- Soporte para clientes de email antiguos (Outlook, etc.)
- Estilos inline (no CSS externo)
- Imágenes con URLs absolutas
- Links con `https://`

### Manejo de Errores
- No bloquear la operación principal si el email falla
- Loguear errores de email para debugging
- Implementar retry básico para fallos transitorios

### Seguridad
- No exponer emails sensibles en logs
- Validar que el email del destinatario existe antes de enviar
- Usar variables de entorno para API keys

---

## 11. Variables de Entorno Necesarias

```env
# Ya existentes
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Por agregar (opcional para desarrollo)
RESEND_TEST_EMAILS=email1@test.com,email2@test.com
```

---

## 12. Verificación de Implementación

Después de implementar, verificar:

1. [ ] Email de solicitud enviada al crear cita PENDING
2. [ ] Email de confirmación al cambiar a CONFIRMED
3. [ ] Email de cancelación al cambiar a CANCELLED
4. [ ] Email de completado al cambiar a COMPLETED
5. [ ] Logs correctos en producción
6. [ ] No hay errores en consola de desarrollo