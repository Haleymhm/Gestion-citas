# VetAppoint - Sistema de Gestión de Citas para Clínicas Veterinarias

VetAppoint es un software integral para la gestión de clínicas veterinarias, que permite administrar clientes, mascotas, citas y el historial médico de los pacientes.

![VetAppoint](./banner.png)

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
| Notificaciones | Resend API (pendiente) |
| UI Components | FullCalendar, ApexCharts |

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
│   └── api-response.ts      # Respuestas API estandarizadas
├── types/
│   └── index.ts             # TypeScript DTOs
└── middleware.ts            # Middleware de autenticación
```

## API Routes

### Autenticación
- `POST /api/v1/auth/signup` - Registro de usuarios
- `POST /api/v1/auth/signin` - Inicio de sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/session` - Obtener sesión actual

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

## Roles y Permisos

| Módulo | ADMIN | VET | RECEPTIONIST | CLIENTE |
|--------|-------|-----|--------------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Gestión de Usuarios | ✅ | ❌ | ❌ | ❌ |
| Gestión de Clientes | ✅ | 👁️ | ✅ | ❌ |
| Gestión de Mascotas | ✅ | ✅ | ✅ | ✅ |
| Agendamiento de Citas | ✅ | ✅ | ✅ | ✅ |
| Historial Médico | ✅ | ✅ | ❌ | ✅ |

## Reglas de Negocio Implementadas

- **RN-01 a RN-05**: Autenticación y roles
- **RN-06 a RN-09**: Gestión de mascotas
- **RN-10 a RN-16**: Agendamiento de citas
- **RN-17 a RN-25**: Historial médico (completo)

## Estado de Desarrollo

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 1 | Inicialización del template | ✅ Completada |
| Fase 2 | Modelado de datos y autenticación | ✅ Completada |
| Fase 3 | Módulos de gestión (usuarios, clientes, mascotas) | ✅ Completada |
| Fase 4 | Módulo de citas y calendario | ✅ Completada |
| Fase 5 | Módulo de historial médico | ✅ Completada |
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