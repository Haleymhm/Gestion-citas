# Plan: Dashboard Veterinario con KPIs

## Decisiones de diseño (confirmadas)

1. **Ingresos**: placeholder `0` en esta fase. Campo se mantiene en el DTO pero sin valor real hasta que se enchufe un modelo `Invoice/Factura` o `price` en `Category`.
2. **Mascotas activas**: mascotas con al menos 1 cita en los últimos 12 meses **y** con citas futuras `PENDING`/`CONFIRMED`.
3. **Consumo de datos**: doble vía. Endpoint público `GET /api/v1/dashboard` (consistente con el resto de la API) **y** consumo interno del server component vía `services/dashboard-metrics.ts` (sin HTTP interno).
4. **Rango**: selector visible (`Mes actual`, `Mes anterior`, `Trimestre actual`, `Año actual`). Estado en URL (`?range=month|prev|quarter|year`) para SSR limpio.

---

## Fases

### A. Backend

**A.1 — Servicio `src/services/dashboard-metrics.ts`**

Función `computeDashboardMetrics(prisma, user, range)` independiente del handler. Calcula:

- `today`: total + `byStatus` (PENDING/CONFIRMED/COMPLETED/CANCELLED/NO_SHOW).
- `pets.active`: mascotas con citas últimos 12 meses **o** citas futuras PENDING/CONFIRMED.
- `pets.newThisMonth`: mascotas creadas en el mes.
- `appointmentsByStatus` (rango seleccionado).
- `speciesDistribution`: `pet.groupBy({ by: ['species'], _count })`.
- `upcomingAppointments` (top 5): `date >= now`, `status IN (PENDING, CONFIRMED)`, `ORDER BY date`, `LIMIT 5`.
- `topVets` (top 5 en rango): `appointment.groupBy({ by: ['vetId'], _count, take: 5 })`.
- `revenueThisMonth`: `0` (placeholder), con TODO documentado.

**A.2 — `GET /api/v1/dashboard`**

- Permisos: `ADMIN`, `VET`, `RECEPTIONIST`.
- Valida query con `dashboardQuerySchema`.
- Filtro por rol: `VET` → `vetId = user.userId`.
- Auditoría: `createAuditLog({ action: 'READ', module: 'Dashboard', ... })`.

**A.3 — Validación Zod**

`dashboardQuerySchema` en `src/lib/validations.ts`:
```
range: enum ['month', 'prev', 'quarter', 'year']; default 'month'
```

### B. Tipos

`src/types/index.ts`:

```ts
type DashboardRange = 'month' | 'prev' | 'quarter' | 'year';

interface TodayKpiDTO {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
}

interface PetsKpiDTO {
  active: number;
  newThisMonth: number;
}

interface RevenueKpiDTO {
  thisMonth: number;        // placeholder 0
  lastMonth: number;        // placeholder 0
  percentChange: number;    // placeholder 0
}

interface UpcomingAppointmentDTO {
  id: number;
  date: Date;
  reason: string;
  status: AppointmentStatus;
  petName: string;
  petId: number;
  ownerName: string;
  vetName: string | null;
  vetId: number | null;
  categoryName: string;
  categoryColor: string;
}

interface TopVetDTO {
  vetId: number;
  vetName: string;
  count: number;
}

interface DashboardMetricsDTO {
  range: DashboardRange;
  generatedAt: Date;
  today: TodayKpiDTO;
  pets: PetsKpiDTO;
  revenue: RevenueKpiDTO;
  appointmentsByStatus: Record<AppointmentStatus, number>;
  speciesDistribution: { species: string; count: number }[];
  upcomingAppointments: UpcomingAppointmentDTO[];
  topVets: TopVetDTO[];
}
```

### C. Frontend

**C.1 — Server component `src/app/(admin)/page.tsx`**

Lee `searchParams.range`, llama `computeDashboardMetrics`, pasa a `<DashboardPanel />`. Sin fetch HTTP interno.

**C.2 — Panel cliente `src/components/dashboard/DashboardPanel.tsx`**

Layout `grid-cols-12`:
- 4× `KpiCard` (citas hoy, mascotas activas, ingresos mes, % cambio).
- `AppointmentsByStatusChart` (ApexCharts bar horizontal).
- `SpeciesDistributionChart` (ApexCharts donut).
- `UpcomingAppointmentsList` (tabla cliente/mascota/hora/vet).
- `TopVetsChart` (ApexCharts bar).
- `DashboardRangeSelector` (links a `?range=...` con `usePathname + useSearchParams`).

**C.3 — Skeletons `src/app/(admin)/loading.tsx`**.

### D. Tests

- `src/test/unit/services/dashboard-metrics.test.ts` — mocks Prisma. Cubre los 4 rangos, los 4 roles, y mascotas activas (citas 12 meses + citas futuras).
- `src/test/unit/lib/dashboard-query.test.ts` — schema Zod.

### E. Filtro por rol

Dentro del servicio:

```ts
const vetFilter = (user.role === 'VET') ? { vetId: user.userId } : {};
```

Aplica a `today`, `appointmentsByStatus`, `upcomingAppointments`, `topVets`.

### F. Documentación

Actualizar `README.md` (módulos implementados + estado de desarrollo) y `PLAN_MAESTRO.md` (Fase 6 → completada con sub-punto 6.0 Dashboard).

### G. QA

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:run`
- `pnpm build:check`

---

## Archivos

| Acción    | Ruta                                                     |
| --------- | -------------------------------------------------------- |
| Crear     | `src/services/dashboard-metrics.ts`                      |
| Crear     | `src/app/api/v1/dashboard/route.ts`                      |
| Modificar | `src/lib/validations.ts`                                 |
| Modificar | `src/types/index.ts`                                     |
| Crear     | `src/test/unit/services/dashboard-metrics.test.ts`       |
| Crear     | `src/test/unit/lib/dashboard-query.test.ts`              |
| Modificar | `src/app/(admin)/page.tsx`                               |
| Crear     | `src/app/(admin)/loading.tsx`                            |
| Crear     | `src/components/dashboard/DashboardPanel.tsx`            |
| Crear     | `src/components/dashboard/KpiCard.tsx`                   |
| Crear     | `src/components/dashboard/AppointmentsByStatusChart.tsx` |
| Crear     | `src/components/dashboard/SpeciesDistributionChart.tsx`  |
| Crear     | `src/components/dashboard/UpcomingAppointmentsList.tsx`  |
| Crear     | `src/components/dashboard/TopVetsChart.tsx`              |
| Crear     | `src/components/dashboard/DashboardRangeSelector.tsx`    |
| Modificar | `README.md`                                              |
| Modificar | `PLAN_MAESTRO.md`                                        |

---

## Orden de ejecución

1. Backend aislado: servicio → endpoint → validaciones → tests.
2. Tipos + tests Zod.
3. Frontend: page.tsx → KpiCard → rango → charts → upcoming → panel → loading.
4. Filtro rol VET.
5. Docs.
6. QA final (`lint`, `typecheck`, `test:run`, `build:check`).
