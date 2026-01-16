# Base de Datos - APPpagos

## Esquema de Base de Datos

El sistema utiliza PostgreSQL como base de datos relacional. El esquema está diseñado para soportar gestión de usuarios, facturas, presupuestos y notificaciones.

## Tablas Principales

### 1. Tabla `profiles`

Almacena la información de los usuarios del sistema.

**Campos:**
- `id` (uuid, PRIMARY KEY): Identificador único del usuario (referencia a auth.users)
- `email` (text, UNIQUE, NOT NULL): Correo electrónico del usuario
- `full_name` (text, NOT NULL): Nombre completo
- `role` (text, NOT NULL): Rol del usuario ('basic_user' o 'area_coordinator')
- `department` (text): Departamento al que pertenece
- `location` (text): Ubicación física (oficina, sucursal, etc.)
- `password_hash` (text): Hash de la contraseña (encriptado con bcrypt)
- `created_at` (timestamptz): Fecha de creación
- `updated_at` (timestamptz): Fecha de última actualización

**Índices:**
- Índice único en `email`
- Índice en `role` para consultas por rol
- Índice en `location` para consultas por ubicación

### 2. Tabla `utility_bills`

Almacena todas las facturas de servicios públicos registradas en el sistema.

**Campos:**
- `id` (uuid, PRIMARY KEY): Identificador único de la factura
- `user_id` (uuid, NOT NULL, FOREIGN KEY → profiles): Usuario que creó la factura
- `service_type` (text, NOT NULL): Tipo de servicio
  - Valores permitidos: 'electricity', 'water', 'gas', 'internet', 'phone', 'waste', 'sewer', 'cellular', 'security', 'administration', 'rent', 'other'
- `provider` (text): Nombre del proveedor del servicio
- `description` (text): Descripción adicional
- `value` (numeric, NOT NULL): Valor base de la factura
- `period` (text, NOT NULL): Período de facturación (formato: YYYY-MM)
- `invoice_number` (text): Número de factura del proveedor
- `contract_number` (text): Número de contrato
- `total_amount` (numeric, NOT NULL): Monto total a pagar
- `consumption` (numeric): Consumo registrado (opcional)
- `unit_of_measure` (text): Unidad de medida (kWh, m³, GB, etc.)
- `cost_center` (text): Centro de costos
- `location` (text, NOT NULL): Ubicación donde se genera el gasto
- `due_date` (date, NOT NULL): Fecha de vencimiento
- `document_url` (text): URL del documento adjunto en Supabase Storage
- `document_name` (text): Nombre del archivo original
- `status` (text, NOT NULL): Estado de la factura
  - Valores: 'draft', 'pending', 'approved', 'overdue', 'paid'
- `notes` (text): Notas adicionales
- `approved_by` (uuid, FOREIGN KEY → profiles): Usuario que aprobó la factura
- `approved_at` (timestamptz): Fecha de aprobación
- `created_at` (timestamptz): Fecha de creación
- `updated_at` (timestamptz): Fecha de última actualización

**Índices:**
- Índice en `user_id` para consultas por usuario
- Índice en `period` para consultas por período
- Índice en `service_type` para filtros por tipo
- Índice en `status` y `due_date` para consultas de facturas vencidas
- Índice compuesto en `location` y `period` para reportes

### 3. Tabla `budget_thresholds`

Define los límites presupuestarios por tipo de servicio y ubicación.

**Campos:**
- `id` (uuid, PRIMARY KEY): Identificador único
- `service_type` (text, NOT NULL): Tipo de servicio
- `location` (text, NOT NULL): Ubicación
- `monthly_limit` (numeric, NOT NULL): Límite mensual en pesos
- `warning_threshold` (numeric, NOT NULL): Porcentaje de alerta (default: 80)
- `created_at` (timestamptz): Fecha de creación
- `updated_at` (timestamptz): Fecha de última actualización

**Restricciones:**
- Constraint UNIQUE en (`service_type`, `location`): Solo un límite por combinación

### 4. Tabla `notifications`

Almacena las notificaciones del sistema para los usuarios.

**Campos:**
- `id` (uuid, PRIMARY KEY): Identificador único
- `user_id` (uuid, NOT NULL, FOREIGN KEY → profiles): Usuario destinatario
- `bill_id` (uuid, FOREIGN KEY → utility_bills): Factura relacionada (opcional)
- `type` (text, NOT NULL): Tipo de notificación
  - Valores: 'due_reminder', 'budget_alert', 'approval_request', 'bill_approved'
- `message` (text, NOT NULL): Mensaje de la notificación
- `read` (boolean, DEFAULT false): Indica si fue leída
- `created_at` (timestamptz): Fecha de creación

**Índices:**
- Índice en `user_id` y `read` para consultas de notificaciones no leídas
- Índice en `created_at` para ordenamiento

## Relaciones entre Tablas

```
profiles (1) ──< (N) utility_bills
  │                    │
  │                    │
  │                    └──> (N) notifications
  │
  └──< (N) utility_bills.approved_by
```

**Explicación:**
- Un usuario puede crear múltiples facturas
- Una factura pertenece a un usuario
- Un usuario puede aprobar múltiples facturas
- Una factura puede tener múltiples notificaciones asociadas
- Un usuario puede recibir múltiples notificaciones

## Row Level Security (RLS)

El sistema implementa seguridad a nivel de fila para proteger los datos según el rol del usuario.

### Políticas para `profiles`
- **Usuarios básicos**: Pueden ver y editar solo su propio perfil
- **Coordinadores**: Pueden ver perfiles de usuarios en su ubicación

### Políticas para `utility_bills`
- **Usuarios básicos**: 
  - Pueden ver, crear, editar y eliminar solo sus propias facturas
  - Pueden cambiar estado solo de borradores a pendiente
- **Coordinadores de área**:
  - Pueden ver todas las facturas de su ubicación
  - Pueden aprobar facturas pendientes
  - Pueden ver facturas de todos los usuarios en su ubicación

### Políticas para `budget_thresholds`
- **Usuarios básicos**: Solo lectura de límites de su ubicación
- **Coordinadores**: Pueden crear, editar y eliminar límites de su ubicación

### Políticas para `notifications`
- Todos los usuarios pueden ver solo sus propias notificaciones
- Pueden marcar como leídas sus notificaciones

## Funciones y Procedimientos Almacenados

### Función `register_user`
Registra un nuevo usuario con contraseña encriptada.

**Parámetros:**
- `p_email` (text): Email del usuario
- `p_password` (text): Contraseña en texto plano
- `p_full_name` (text): Nombre completo
- `p_location` (text): Ubicación

**Retorna:** UUID del usuario creado

**Funcionalidad:**
- Encripta la contraseña con bcrypt
- Crea el registro en la tabla `profiles`
- Asigna rol 'basic_user' por defecto

### Función `check_password`
Verifica si una contraseña es correcta para un usuario.

**Parámetros:**
- `user_email` (text): Email del usuario
- `user_password` (text): Contraseña a verificar

**Retorna:** Boolean (true si es correcta, false si no)

**Funcionalidad:**
- Busca el usuario por email
- Compara la contraseña con el hash almacenado usando bcrypt

## Consultas Frecuentes

### Obtener facturas de un usuario
```sql
SELECT * FROM utility_bills 
WHERE user_id = 'uuid-del-usuario'
ORDER BY created_at DESC;
```

### Obtener facturas pendientes de una ubicación
```sql
SELECT * FROM utility_bills 
WHERE location = 'Oficina Bogotá' 
  AND status = 'pending'
ORDER BY due_date ASC;
```

### Calcular total mensual por tipo de servicio
```sql
SELECT 
  service_type,
  SUM(total_amount) as total
FROM utility_bills
WHERE period = '2025-11'
  AND status IN ('approved', 'paid')
GROUP BY service_type;
```

### Obtener facturas vencidas
```sql
SELECT * FROM utility_bills
WHERE due_date < CURRENT_DATE
  AND status NOT IN ('paid', 'overdue')
ORDER BY due_date ASC;
```

### Verificar si se excedió el presupuesto
```sql
SELECT 
  bt.service_type,
  bt.location,
  bt.monthly_limit,
  COALESCE(SUM(ub.total_amount), 0) as gasto_actual,
  (COALESCE(SUM(ub.total_amount), 0) / bt.monthly_limit * 100) as porcentaje
FROM budget_thresholds bt
LEFT JOIN utility_bills ub ON 
  ub.service_type = bt.service_type 
  AND ub.location = bt.location
  AND ub.period = '2025-11'
  AND ub.status IN ('approved', 'paid')
GROUP BY bt.id, bt.service_type, bt.location, bt.monthly_limit
HAVING (COALESCE(SUM(ub.total_amount), 0) / bt.monthly_limit * 100) >= bt.warning_threshold;
```

## Mantenimiento

### Backup
Se recomienda realizar backups regulares de la base de datos:
```bash
# Backup completo
pg_dump -U postgres apppagos > backup_$(date +%Y%m%d).sql

# Backup solo esquema
pg_dump -U postgres -s apppagos > schema_backup.sql

# Backup solo datos
pg_dump -U postgres -a apppagos > data_backup.sql
```

### Limpieza de Datos Antiguos
Considera implementar un proceso de limpieza para:
- Notificaciones leídas mayores a 90 días
- Facturas pagadas mayores a 2 años (archivar)

### Optimización
- Los índices se crean automáticamente con las migraciones
- Monitorea el rendimiento de consultas lentas
- Considera particionar la tabla `utility_bills` por período si crece mucho

## Migraciones

Las migraciones están en la carpeta `supabase/migrations/`:
- `20251001212345_create_utility_bills_schema.sql`: Esquema inicial
- `20250115000000_add_contract_number.sql`: Agregar campo contract_number

Para aplicar migraciones:
```bash
psql -U postgres -d apppagos -f supabase/migrations/nombre_migracion.sql
```

## Próximos Pasos

- Consulta la [documentación de la API](05-API-Endpoints.md) para ver cómo se usan estas tablas
- Revisa la [documentación de seguridad](06-Seguridad-Autenticacion.md) para entender las políticas RLS

