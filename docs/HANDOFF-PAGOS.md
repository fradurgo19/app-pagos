# Handoff — Módulo de Pagos / Facturas (APPpagos → otro proyecto)

Documento para el equipo que integrará el módulo de facturas en la aplicación destino (Supabase `dsnowunofuxkxbinvknf`).

**Repositorio de referencia:** `fradurgo19/app-pagos`

---

## 1. Resumen ejecutivo

Los datos de pagos ya están migrados al Supabase destino. La otra aplicación **no debe usar** su tabla `profiles` (roles `admin`, `infrastructure`, etc.). El módulo de pagos usa tablas dedicadas:

| Recurso | Tabla / bucket |
|---------|----------------|
| Usuarios pagos | `pagos_profiles` |
| Facturas | `utility_bills` |
| Líneas de consumo | `bill_consumptions` |
| PDFs / imágenes | bucket Storage `invoices` |

**Estado migrado (jun 2026):** ~50 facturas, 50 documentos en Storage, 3 carpetas de usuario.

---

## 2. Arquitectura

```
┌─────────────────┐     JWT propio      ┌──────────────────┐
│  Frontend React │ ◄──────────────────►│  Backend Express │
│  (otra app)     │     REST /api/*     │  (portar de APP) │
└────────┬────────┘                     └────────┬─────────┘
         │                                         │
         │                              service_role key
         ▼                                         ▼
┌────────────────────────────────────────────────────────────┐
│              Supabase destino (dsnowunofuxkxbinvknf)        │
│  pagos_profiles │ utility_bills │ bill_consumptions         │
│  Storage: invoices/{user_id}/{archivo}.pdf                 │
└────────────────────────────────────────────────────────────┘
```

- **Auth de pagos:** JWT emitido por el backend (`JWT_SECRET`), no Supabase Auth para usuarios de `pagos_profiles`.
- **Permisos:** aplicados en el backend (Express), no depender de RLS de `profiles` de la otra app.

---

## 3. Base de datos

### 3.1 `pagos_profiles` (usuarios del módulo)

```sql
id              uuid PK
email           text UNIQUE NOT NULL
password_hash   text NOT NULL          -- bcrypt via pgcrypto
full_name       text NOT NULL
role            text NOT NULL          -- 'basic_user' | 'area_coordinator'
department      text
location        text
created_at      timestamptz
updated_at      timestamptz
```

### 3.2 `utility_bills` (cabecera)

| Columna | Tipo | Notas |
|---------|------|-------|
| `user_id` | uuid | FK → `pagos_profiles.id` |
| `service_type` | text | electricity, water, gas, … |
| `provider` | text | |
| `description` | text | |
| `value` | numeric | Suma de consumos |
| `total_amount` | numeric | Suma de consumos |
| `consumption` | numeric | Suma opcional |
| `unit_of_measure` | text | kWh, m³, … |
| `period` | text | **YYYY-MM** |
| `invoice_number` | text | |
| `contract_number` | text | |
| `cost_center` | text | |
| `city` | text | Catálogo sedes |
| `business_group` | text | Catálogo sedes |
| `location` | text | Dirección sede |
| `due_date` | date | |
| `document_url` | text | URL pública Storage |
| `document_name` | text | Nombre legible en UI |
| `status` | text | draft, pending, approved, overdue, paid |
| `approved_by` | uuid | FK → `pagos_profiles.id` (opcional) |
| `approved_at` | timestamptz | |
| `notes` | text | |

### 3.3 `bill_consumptions` (detalle — 1 factura, N filas)

| Columna | Tipo |
|---------|------|
| `bill_id` | uuid → `utility_bills.id` |
| `service_type` | text |
| `provider` | text |
| `period_from` | date |
| `period_to` | date |
| `value` | numeric |
| `total_amount` | numeric |
| `consumption` | numeric |
| `unit_of_measure` | text |

### 3.4 Diagrama ER

```
pagos_profiles ──< utility_bills ──< bill_consumptions
       │
       └──< utility_bills.approved_by
```

### 3.5 Script SQL destino

Ejecutar / conservar como referencia:

- `supabase/pagos-destination-setup.sql` — esquema + funciones con `pagos_profiles`
- `supabase/complete-missing-tables.sql` — tablas facturas (adaptar FK a `pagos_profiles`)
- `supabase/migrations/20260313120000_add_city_and_business_group.sql`

---

## 4. Storage

| Propiedad | Valor |
|-----------|-------|
| Bucket | `invoices` |
| Público | **Sí** (URLs usan `/object/public/`) |
| Ruta | `{user_id}/{timestamp}-{random}.ext` |

Ejemplo URL:

```
https://dsnowunofuxkxbinvknf.supabase.co/storage/v1/object/public/invoices/4a215d22-e87d-4e21-be70-a3c9480f17b7/1781641949568-qnsjm.pdf
```

**Importante:** `document_name` (ej. `Factura Junio.pdf`) es solo etiqueta en UI. El archivo en Storage debe llamarse como en la URL (`1781641949568-qnsjm.pdf`).

Subida (backend):

```js
// backend/supabaseClient.js
filePath = `${userId}/${Date.now()}-${random}.${ext}`
bucket: 'invoices'
contentType: file.mimetype  // application/pdf, image/jpeg, image/png
```

---

## 5. Roles y pantallas

| Rol | Valor DB | Menú |
|-----|----------|------|
| Usuario estándar | `basic_user` | Nueva factura, Mis facturas |
| Coordinador | `area_coordinator` | Panel, Facturas, Usuarios + lo anterior |

### Rutas frontend (referencia `src/App.tsx`)

| Ruta | Componente | Rol |
|------|------------|-----|
| `/new-bill` | `NewBillPage` | todos |
| `/reports` | `ReportsPage` | todos |
| `/` | `DashboardPage` | coordinador |
| `/bills` | `BillsPage` | coordinador |
| `/users` | `UsersPage` | coordinador |
| `/reports/edit/:id` | `EditBillPage` | todos (propias) |

### Reglas de acceso (backend)

| Acción | basic_user | area_coordinator |
|--------|------------|------------------|
| Listar facturas | Solo `user_id = yo` | Todas |
| Crear factura | Sí (`user_id = yo`) | Sí |
| Editar / borrar | Solo propias | Propias en PUT/DELETE individual |
| Borrar draft | Solo propias, `status = draft` | Igual en DELETE simple |
| Bulk delete | Solo propias | Todas (RPC) |
| Aprobar / cambiar estado | No | Sí |
| Listar / CRUD usuarios pagos | No | Sí |

---

## 6. API REST (contrato)

Base: `VITE_API_URL` → backend Express.

**Auth:** `Authorization: Bearer <jwt>`

### Auth

| Método | Ruta | Body |
|--------|------|------|
| POST | `/api/auth/signup` | `{ email, password, fullName, location }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/profile` | — |
| GET | `/api/auth/verify` | — |

### Facturas

| Método | Ruta | Notas |
|--------|------|-------|
| GET | `/api/bills` | Query: `period`, `serviceType`, `location`, `status`, `search` |
| GET | `/api/bills/:id` | |
| POST | `/api/bills` | Requiere `consumptions[]` (mín. 1) |
| PUT | `/api/bills/:id` | |
| DELETE | `/api/bills/:id` | Solo draft propio |
| POST | `/api/bills/bulk-delete` | `{ ids: string[] }` |
| POST | `/api/bills/:id/approve` | Coordinador |
| PATCH | `/api/bills/:id/status` | `{ status: 'pending' \| 'approved' }` |

### Archivos

| Método | Ruta | Notas |
|--------|------|-------|
| POST | `/api/upload` | `multipart/form-data`, campo `file`, máx 10MB, PDF/JPG/PNG |

### Usuarios (coordinador)

| Método | Ruta |
|--------|------|
| GET | `/api/users` |
| POST | `/api/users/create` |
| PUT | `/api/users/:id` |
| DELETE | `/api/users/:id` |

### Convención de nombres

- **PostgreSQL:** `snake_case`
- **JSON API / React:** `camelCase`
- El backend transforma con `transformBillToFrontend` / `transformConsumptionToFrontend` (`backend/server.js`).

### Ejemplo POST `/api/bills`

```json
{
  "description": "Factura servicios",
  "period": "2026-06",
  "invoiceNumber": "12345",
  "contractNumber": "67890",
  "costCenter": "Administración",
  "city": "MEDELLIN",
  "businessGroup": "PARTEQUIPOS S.A.S.",
  "location": "CRA 50 NRO.35-32",
  "dueDate": "2026-06-20",
  "documentUrl": "https://.../invoices/userId/archivo.pdf",
  "documentName": "Factura Junio.pdf",
  "status": "pending",
  "notes": "",
  "consumptions": [
    {
      "serviceType": "electricity",
      "provider": "EPM (Empresas Públicas de Medellín)",
      "periodFrom": "2026-05-01",
      "periodTo": "2026-06-01",
      "value": "150000",
      "totalAmount": "180000",
      "consumption": "1200",
      "unitOfMeasure": "kWh"
    }
  ]
}
```

**Lógica al crear (no cambiar):**

1. Validar al menos 1 consumo.
2. `value` = Σ `consumptions[].value`
3. `totalAmount` = Σ `consumptions[].totalAmount` (o body si viene)
4. `serviceType` / `provider` del primer consumo si faltan en cabecera.
5. Insertar `utility_bills` + `bill_consumptions`.
6. Email opcional a coordinación (ver `emailService.js`).

---

## 7. Tipos TypeScript

Archivo: `src/types/index.ts`

```ts
type ServiceType = 'electricity' | 'water' | 'gas' | 'internet' | 'phone' |
  'waste' | 'sewer' | 'cellular' | 'security' | 'administration' |
  'rent' | 'public_lighting' | 'other';

type BillStatus = 'draft' | 'pending' | 'approved' | 'overdue' | 'paid';
type UserRole = 'basic_user' | 'area_coordinator';
```

---

## 8. Catálogos de negocio

### Ubicaciones (cascada Ciudad → Grupo → Dirección)

Archivo: `src/constants/billLocations.ts` — 23 sedes.

Helpers: `getBillLocationCities()`, `getBillLocationBusinessGroups(city)`, `getBillLocationAddresses(city, group)`.

### Tipos de servicio y proveedores

Archivo: `src/organisms/BillForm.tsx` — mapas `serviceTypeOptions` y `providerOptionsRaw` por tipo.

No eliminar proveedores sin validar con negocio (EMCALI, GASES DEL CARIBE, Enel, EPM, etc.).

### Validación formulario

Archivo: `src/utils/validators.ts`

- `period` regex: `^\d{4}-(0[1-9]|1[0-2])$`
- Ciudad, grupo, ubicación, vencimiento requeridos.
- Cada consumo: tipo, proveedor, fechas, monto > 0.

---

## 9. Archivos a portar del repo APPpagos

### Backend (obligatorio)

| Archivo | Uso |
|---------|-----|
| `backend/server.js` | API completa — **cambiar `profiles` → `pagos_profiles`** |
| `backend/supabaseClient.js` | Cliente DB + Storage + upload |
| `backend/emailService.js` | Notificaciones correo (opcional) |

### Frontend (módulo facturas)

| Archivo | Uso |
|---------|-----|
| `src/organisms/BillForm.tsx` | Formulario crear/editar |
| `src/organisms/BillsTable.tsx` | Tabla coordinador |
| `src/molecules/BillDetailsModal.tsx` | Detalle + enlace documento |
| `src/molecules/FileUpload.tsx` | Subida archivo |
| `src/pages/NewBillPage.tsx` | Nueva factura |
| `src/pages/ReportsPage.tsx` | Mis facturas |
| `src/pages/BillsPage.tsx` | Gestión coordinador |
| `src/pages/EditBillPage.tsx` | Edición |
| `src/services/billService.ts` | Cliente HTTP |
| `src/services/authService.ts` | Login pagos |
| `src/hooks/useBills.ts` | Hook listado |
| `src/types/index.ts` | Tipos |
| `src/constants/billLocations.ts` | Sedes |
| `src/utils/validators.ts` | Validación |
| `src/utils/formatters.ts` | Moneda, fechas |
| `src/utils/billFormUtils.ts` | Helpers formulario |
| `src/components/RoleProtectedRoute.tsx` | Guard rutas |

### Dashboard / KPIs (fase 2, coordinador)

| Archivo |
|---------|
| `src/pages/DashboardPage.tsx` |
| `src/organisms/DashboardCharts.tsx` |
| `src/hooks/useDashboardData.ts` |
| `src/hooks/useDashboardComparison.ts` |
| `src/hooks/useDashboardFilterOptions.ts` |

---

## 10. Cambio obligatorio en backend

En `backend/server.js` (y funciones SQL), reemplazar:

```js
.from('profiles')
```

por:

```js
.from('pagos_profiles')
```

Y en SQL pool queries:

```sql
SELECT ... FROM profiles   →   SELECT ... FROM pagos_profiles
```

**Buscar también:** `register_user`, `check_password`, `verify_credentials`, `bulk_delete_utility_bills` — deben leer `pagos_profiles`.

La tabla `profiles` de la otra app **no se toca**.

---

## 11. Variables de entorno

### Backend

```env
VITE_SUPABASE_URL=https://dsnowunofuxkxbinvknf.supabase.co
SUPABASE_SERVICE_KEY=<service_role_destino>

SUPABASE_STORAGE_URL=https://dsnowunofuxkxbinvknf.supabase.co
SUPABASE_STORAGE_KEY=<service_role_destino>

DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
JWT_SECRET=<secreto-fuerte>

PORT=3000
NODE_ENV=production
```

### Frontend (otra app)

```env
VITE_API_URL=https://<backend-del-otro-proyecto>
```

---

## 12. Estrategia de integración recomendada

### Fase 1 — MVP facturas

1. Portar backend bills + auth pagos (con `pagos_profiles`).
2. Rutas en la otra app: `/pagos/login`, `/pagos/new-bill`, `/pagos/reports`.
3. Login pagos separado del login principal (mismo Supabase, distinta tabla).
4. Probar con usuarios migrados en `pagos_profiles`.

### Fase 2 — Coordinación

1. Dashboard + `/pagos/bills` + gestión usuarios pagos.
2. Aprobación de facturas.

### Fase 3 — Opcional

1. SSO entre `profiles` y `pagos_profiles`.
2. Notificaciones / `budget_thresholds`.

---

## 13. Validación post-implementación

```sql
-- Conteos
SELECT 'pagos_profiles' AS tabla, COUNT(*) FROM pagos_profiles
UNION ALL SELECT 'utility_bills', COUNT(*) FROM utility_bills
UNION ALL SELECT 'bill_consumptions', COUNT(*) FROM bill_consumptions;

-- Integridad FK
SELECT COUNT(*) AS bills_sin_usuario
FROM utility_bills b
LEFT JOIN pagos_profiles p ON p.id = b.user_id
WHERE p.id IS NULL;

SELECT COUNT(*) AS consumos_huerfanos
FROM bill_consumptions c
LEFT JOIN utility_bills b ON b.id = c.bill_id
WHERE b.id IS NULL;

-- URLs destino
SELECT COUNT(*) AS urls_origen
FROM utility_bills
WHERE document_url LIKE '%rafmynmmenebreqeagvm%';
-- Debe ser 0
```

### Pruebas manuales

1. Login `basic_user` → `/reports` muestra solo sus facturas.
2. Abrir `document_url` en navegador → PDF visible.
3. Nueva factura con PDF → aparece en listado.
4. Login `area_coordinator` → ve todas las facturas.
5. Aprobar factura → `status = approved`.

---

## 14. Origen vs destino

| | Origen APPpagos | Destino |
|--|-----------------|---------|
| Supabase ref | `rafmynmmenebreqeagvm` | `dsnowunofuxkxbinvknf` |
| Usuarios | `profiles` | `pagos_profiles` |
| Producción actual | app-pagos-rho.vercel.app | (otra app) |

---

## 15. Contacto / dudas técnicas

Para comportamiento exacto de un endpoint, leer `backend/server.js` en el repo APPpagos.

Para esquema SQL idempotente en destino: `supabase/pagos-destination-setup.sql`.
