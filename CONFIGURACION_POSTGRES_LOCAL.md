# 🐘 Configuración PostgreSQL 17 Local - APPpagos

## ✅ Configuración Completada

El proyecto ahora está configurado para usar **PostgreSQL 17 local** en desarrollo.

---

## 🎯 Arquitectura de Base de Datos

- **DESARROLLO (Ahora)**: PostgreSQL 17 Local
- **PRODUCCIÓN (Futuro)**: Neon (PostgreSQL en la nube)

---

## 📁 Archivos Creados

### 1. `database/setup-local-postgres.sql`
Script principal de configuración que crea:
- ✅ 5 tablas (profiles, utility_bills, budget_thresholds, notifications, sessions)
- ✅ Extensiones necesarias (uuid-ossp, pgcrypto)
- ✅ Índices para optimización
- ✅ Triggers para updated_at
- ✅ Funciones de utilidad (register_user, verify_credentials)

### 2. `database/seed-data.sql`
Datos de prueba opcionales:
- ✅ 3 usuarios de ejemplo (admin, usuario1, usuario2)
- ✅ 8+ facturas de muestra
- ✅ Umbrales de presupuesto
- ✅ Notificaciones de ejemplo

### 3. `database/README.md`
Documentación completa con:
- ✅ Guía de instalación paso a paso
- ✅ Comandos útiles de PostgreSQL
- ✅ Solución de problemas comunes
- ✅ Instrucciones de backup y restauración
- ✅ Guía de migración a Neon (futuro)

---

## 🚀 Inicio Rápido

### Paso 1: Verificar PostgreSQL 17

```bash
# Verificar instalación
psql --version
# Debe mostrar: psql (PostgreSQL) 17.x
```

Si no tienes PostgreSQL 17 instalado:
- **Windows**: [Descargar PostgreSQL 17](https://www.postgresql.org/download/windows/)
- **Linux**: `sudo apt install postgresql-17`
- **Mac**: `brew install postgresql@17`

### Paso 2: Crear la Base de Datos

```bash
# Conectarse como superusuario
psql -U postgres

# Dentro de psql:
CREATE DATABASE apppagos;
\l  # Ver bases de datos
\q  # Salir
```

### Paso 3: Ejecutar Configuración

```bash
# Desde la raíz del proyecto
cd database

# Ejecutar script
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

### Paso 4: (Opcional) Datos de Prueba

```bash
# Insertar usuarios y facturas de ejemplo
psql -U postgres -d apppagos -f seed-data.sql
```

**Usuarios de prueba creados:**
| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@apppagos.com | admin123 | Coordinador de Área |
| usuario1@apppagos.com | user123 | Usuario Básico |
| usuario2@apppagos.com | user123 | Usuario Básico |

### Paso 5: Configurar Variables de Entorno

Crea o actualiza `.env` en la raíz del proyecto:

```env
# PostgreSQL 17 Local
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/apppagos

# Supabase (OPCIONAL - para auth)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Entorno
NODE_ENV=development
```

### Paso 6: Ejecutar la Aplicación

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar en modo desarrollo
npm run dev
```

---

## 🔍 Verificar la Instalación

### Conectarse a la base de datos

```bash
psql -U postgres -d apppagos
```

### Ver todas las tablas

```sql
\dt
```

**Deberías ver:**
```
 Schema |       Name        | Type  |  Owner
--------+-------------------+-------+----------
 public | budget_thresholds | table | postgres
 public | notifications     | table | postgres
 public | profiles          | table | postgres
 public | sessions          | table | postgres
 public | utility_bills     | table | postgres
```

### Ver usuarios creados

```sql
SELECT email, full_name, role, location FROM profiles;
```

### Ver facturas

```sql
SELECT 
  service_type,
  provider,
  total_amount,
  status
FROM utility_bills
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📊 Estructura de Tablas

### profiles (Usuarios)
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- role (TEXT: 'basic_user' | 'area_coordinator')
- password_hash (TEXT)
- department (TEXT)
- location (TEXT)
- created_at, updated_at
```

### utility_bills (Facturas)
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- service_type (TEXT)
- provider (TEXT)
- value, total_amount (NUMERIC)
- period (TEXT: 'YYYY-MM')
- invoice_number (TEXT)
- consumption (NUMERIC)
- unit_of_measure (TEXT)
- location (TEXT)
- due_date (DATE)
- status (TEXT: 'draft' | 'pending' | 'approved' | 'overdue' | 'paid')
- approved_by (UUID, FK → profiles)
- created_at, updated_at
```

---

## 🔧 Funciones Útiles

### Registrar un nuevo usuario

```sql
SELECT register_user(
  'nuevo@email.com',
  'contraseña123',
  'Nombre Completo',
  'Oficina Bogotá'
);
```

### Verificar credenciales

```sql
SELECT * FROM verify_credentials(
  'admin@apppagos.com',
  'admin123'
);
```

---

## 🚨 Solución de Problemas

### Error: "database apppagos does not exist"

```bash
createdb apppagos
```

### Error: "role postgres does not exist"

```bash
createuser -s postgres
```

### Error: "password authentication failed"

1. Edita `pg_hba.conf`:
   - Windows: `C:\Program Files\PostgreSQL\17\data\pg_hba.conf`
   - Linux: `/etc/postgresql/17/main/pg_hba.conf`

2. Cambia de `peer` a `md5`:
   ```
   local   all   postgres   md5
   ```

3. Reinicia PostgreSQL:
   ```bash
   # Windows
   pg_ctl restart
   
   # Linux
   sudo systemctl restart postgresql
   ```

### Ver logs de PostgreSQL

```bash
# Windows
# C:\Program Files\PostgreSQL\17\data\log\

# Linux
sudo tail -f /var/log/postgresql/postgresql-17-main.log
```

---

## 🔐 Seguridad

### Cambiar contraseña de postgres

```sql
ALTER USER postgres PASSWORD 'nueva_contraseña_segura';
```

### Crear usuario dedicado para la app

```sql
-- Crear usuario
CREATE USER apppagos_app WITH PASSWORD 'contraseña_segura';

-- Dar permisos
GRANT CONNECT ON DATABASE apppagos TO apppagos_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO apppagos_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO apppagos_app;
```

Actualiza `.env`:
```env
DATABASE_URL=postgresql://apppagos_app:contraseña_segura@localhost:5432/apppagos
```

---

## 💾 Backup y Restauración

### Crear backup

```bash
# Backup completo
pg_dump -U postgres apppagos > backup_$(date +%Y%m%d).sql

# Solo estructura
pg_dump -U postgres -s apppagos > schema.sql

# Solo datos
pg_dump -U postgres -a apppagos > data.sql
```

### Restaurar

```bash
psql -U postgres -d apppagos < backup_20250101.sql
```

---

## 🌐 Migración a Neon (Producción Futura)

Cuando estés listo para producción:

### 1. Crear proyecto en Neon

1. Ve a https://neon.tech
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Obtén la cadena de conexión

### 2. Ejecutar migración

```bash
# Conectarse a Neon
psql postgresql://usuario:password@ep-proyecto.us-east-2.aws.neon.tech/neondb

# Ejecutar el mismo script
\i database/setup-local-postgres.sql
```

### 3. Migrar datos

```bash
# Exportar desde local
pg_dump -U postgres apppagos > local_backup.sql

# Importar a Neon
psql postgresql://...neon.tech/neondb < local_backup.sql
```

### 4. Actualizar variables de entorno

```env
# .env.production
DATABASE_URL=postgresql://usuario:password@ep-proyecto.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 📈 Optimización

### Analizar rendimiento

```sql
-- Ver estadísticas
SELECT * FROM pg_stat_user_tables;

-- Analizar consulta
EXPLAIN ANALYZE 
SELECT * FROM utility_bills WHERE user_id = 'uuid-aqui';
```

### Mantenimiento

```sql
-- Optimizar base de datos
VACUUM ANALYZE;

-- Por tabla
VACUUM ANALYZE utility_bills;
```

---

## 📚 Recursos

- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Neon Documentation](https://neon.tech/docs/)

---

## ✅ Checklist de Verificación

- [ ] PostgreSQL 17 instalado
- [ ] Base de datos `apppagos` creada
- [ ] Script `setup-local-postgres.sql` ejecutado exitosamente
- [ ] Datos de prueba insertados (opcional)
- [ ] Archivo `.env` configurado
- [ ] Conexión a la base de datos verificada
- [ ] Aplicación ejecutándose correctamente

---

**🎉 ¡Tu base de datos PostgreSQL 17 local está lista para desarrollo!**

Para cualquier duda, consulta el archivo `database/README.md` con documentación completa.

