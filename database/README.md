# 🗄️ Configuración de Base de Datos

## PostgreSQL 17 Local (Desarrollo)

Este proyecto usa **PostgreSQL 17** instalado localmente para desarrollo.

---

## 📋 Requisitos Previos

- ✅ PostgreSQL 17 instalado
- ✅ Acceso a `psql` (cliente de PostgreSQL)
- ✅ Usuario con permisos de superusuario (por defecto: `postgres`)

---

## 🚀 Instalación y Configuración

### 1. Verificar PostgreSQL 17

```bash
# Verificar versión
psql --version
# Debe mostrar: psql (PostgreSQL) 17.x

# Verificar que el servicio está corriendo
# Windows:
pg_ctl status

# Linux/Mac:
sudo systemctl status postgresql
```

### 2. Crear la Base de Datos

```bash
# Conectarse como superusuario
psql -U postgres

# Crear la base de datos
CREATE DATABASE apppagos;

# Ver bases de datos creadas
\l

# Salir
\q
```

### 3. Ejecutar el Script de Configuración

```bash
# Desde la raíz del proyecto
cd database

# Ejecutar el script de setup
psql -U postgres -d apppagos -f setup-local-postgres.sql
```

**Deberías ver:**
```
✅ Base de datos configurada correctamente
📊 Tablas creadas: profiles, utility_bills, budget_thresholds, notifications, sessions
🔧 Extensiones instaladas: uuid-ossp, pgcrypto
⚡ Índices y triggers configurados

🚀 La base de datos está lista para usar!
```

---

## 🔐 Configurar Variables de Entorno

Crea o actualiza el archivo `.env` en la raíz del proyecto:

```env
# PostgreSQL 17 Local
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/apppagos

# Supabase (solo para autenticación en desarrollo)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Entorno
NODE_ENV=development
```

**Nota:** Reemplaza `tu_password` con tu contraseña de PostgreSQL.

---

## 📊 Estructura de la Base de Datos

### Tablas Creadas

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuarios con autenticación |
| `utility_bills` | Facturas de servicios públicos |
| `budget_thresholds` | Umbrales de presupuesto por servicio |
| `notifications` | Notificaciones del sistema |
| `sessions` | Sesiones de usuario (tokens) |

### Diagrama de Relaciones

```
profiles
  ├── utility_bills (user_id)
  ├── notifications (user_id)
  └── sessions (user_id)

utility_bills
  └── profiles (approved_by)
```

---

## 👤 Crear Usuario de Prueba

### Opción 1: SQL Directo

```sql
-- Conectarse a la base de datos
psql -U postgres -d apppagos

-- Crear usuario de prueba
SELECT register_user(
  'admin@apppagos.com',
  'admin123',
  'Administrador Sistema',
  'Oficina Principal'
);
```

### Opción 2: Desde la Aplicación

Usa la página de registro (`/signup`) para crear un usuario.

---

## 🔍 Comandos Útiles de PostgreSQL

### Ver todas las tablas
```sql
\dt
```

### Describir una tabla
```sql
\d profiles
\d utility_bills
```

### Ver todos los usuarios
```sql
SELECT id, email, full_name, role, location FROM profiles;
```

### Ver todas las facturas
```sql
SELECT 
  ub.id,
  p.full_name as usuario,
  ub.service_type,
  ub.total_amount,
  ub.status
FROM utility_bills ub
JOIN profiles p ON ub.user_id = p.id
ORDER BY ub.created_at DESC;
```

### Verificar extensiones instaladas
```sql
\dx
```

---

## 🧪 Datos de Prueba (Opcional)

Para insertar datos de prueba, ejecuta:

```bash
psql -U postgres -d apppagos -f database/seed-data.sql
```

O edita el archivo `setup-local-postgres.sql` y descomenta la sección de datos de prueba.

---

## 🔄 Migraciones Futuras

### Crear una nueva migración

1. Crea un archivo en `database/migrations/`:
   ```
   YYYYMMDD_HHMMSS_nombre_descriptivo.sql
   ```

2. Ejemplo: `20250101_120000_add_payment_methods.sql`

3. Ejecuta:
   ```bash
   psql -U postgres -d apppagos -f database/migrations/20250101_120000_add_payment_methods.sql
   ```

---

## 🚨 Solución de Problemas

### Error: "role postgres does not exist"

```bash
# Crear el rol postgres
createuser -s postgres
```

### Error: "database apppagos does not exist"

```bash
createdb apppagos
```

### Error: "password authentication failed"

1. Verifica tu contraseña de PostgreSQL
2. Actualiza el archivo `pg_hba.conf`:
   ```
   # Windows: C:\Program Files\PostgreSQL\17\data\pg_hba.conf
   # Linux: /etc/postgresql/17/main/pg_hba.conf
   
   # Cambiar de 'peer' a 'md5'
   local   all   postgres   md5
   ```
3. Reinicia PostgreSQL

### Ver logs de PostgreSQL

```bash
# Windows
# Ver en: C:\Program Files\PostgreSQL\17\data\log\

# Linux
sudo tail -f /var/log/postgresql/postgresql-17-main.log
```

---

## 🔐 Seguridad

### Cambiar contraseña de postgres

```sql
ALTER USER postgres PASSWORD 'nueva_contraseña_segura';
```

### Crear usuario con permisos limitados

```sql
-- Crear usuario de aplicación
CREATE USER apppagos_app WITH PASSWORD 'contraseña_segura';

-- Dar permisos solo a la base de datos
GRANT CONNECT ON DATABASE apppagos TO apppagos_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO apppagos_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO apppagos_app;
```

Luego usa este usuario en tu `.env`:
```env
DATABASE_URL=postgresql://apppagos_app:contraseña_segura@localhost:5432/apppagos
```

---

## 🔄 Backup y Restauración

### Crear backup

```bash
# Backup completo
pg_dump -U postgres apppagos > backup_$(date +%Y%m%d).sql

# Solo esquema
pg_dump -U postgres -s apppagos > schema_backup.sql

# Solo datos
pg_dump -U postgres -a apppagos > data_backup.sql
```

### Restaurar backup

```bash
# Restaurar desde archivo
psql -U postgres -d apppagos < backup_20250101.sql
```

---

## 📈 Optimización

### Analizar rendimiento

```sql
-- Ver estadísticas de tablas
SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';

-- Ver índices
SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- Analizar consultas lentas
EXPLAIN ANALYZE SELECT * FROM utility_bills WHERE user_id = 'uuid-here';
```

### Vacuum y Analyze

```sql
-- Optimizar base de datos
VACUUM ANALYZE;

-- Por tabla específica
VACUUM ANALYZE utility_bills;
```

---

## 🌐 Migración a Neon (Futuro)

Cuando estés listo para producción con Neon:

1. Crea una cuenta en [Neon](https://neon.tech)
2. Crea un proyecto nuevo
3. Obtén la URL de conexión
4. Ejecuta el mismo script `setup-local-postgres.sql` en Neon
5. Actualiza `.env.production`:
   ```env
   DATABASE_URL=postgresql://usuario:password@ep-proyecto.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## 📞 Soporte

Para más información sobre PostgreSQL 17:
- [Documentación Oficial](https://www.postgresql.org/docs/17/)
- [Tutorial PostgreSQL](https://www.postgresqltutorial.com/)

---

**✅ Base de datos configurada y lista para desarrollo local**

