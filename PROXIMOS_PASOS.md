# ✅ Base de Datos Configurada - Próximos Pasos

## 🎉 ¡Excelente! Tu base de datos PostgreSQL 17 está lista

Las siguientes tablas fueron creadas exitosamente:
- ✅ profiles (usuarios)
- ✅ utility_bills (facturas)
- ✅ budget_thresholds (umbrales de presupuesto)
- ✅ notifications (notificaciones)
- ✅ sessions (sesiones)

---

## 📝 PASO 1: Crear archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto con este contenido:

```env
# PostgreSQL 17 Local - DESARROLLO
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/apppagos

# Supabase (para autenticación y storage)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Entorno
NODE_ENV=development
```

**IMPORTANTE:** Reemplaza:
- `TU_PASSWORD` con tu contraseña de PostgreSQL
- Las credenciales de Supabase con las tuyas (obtén en https://app.supabase.com)

---

## 🎯 PASO 2 (OPCIONAL): Insertar Datos de Prueba

Para tener usuarios y facturas de ejemplo, ejecuta:

```powershell
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project\database"
psql -U postgres -d apppagos -f seed-data.sql
```

Esto creará:
- **3 usuarios de prueba** (admin, usuario1, usuario2)
- **8+ facturas** de ejemplo
- **Umbrales de presupuesto**
- **Notificaciones**

### Usuarios de Prueba Creados:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@apppagos.com | admin123 | Coordinador de Área |
| usuario1@apppagos.com | user123 | Usuario Básico |
| usuario2@apppagos.com | user123 | Usuario Básico |

---

## 🚀 PASO 3: Ejecutar la Aplicación

```bash
# Asegúrate de estar en la raíz del proyecto
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"

# Instalar dependencias (si no lo has hecho)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

---

## 🔍 PASO 4: Verificar la Conexión

Puedes verificar que todo está bien conectándote a la base de datos:

```powershell
psql -U postgres -d apppagos
```

Dentro de psql, ejecuta:

```sql
-- Ver todas las tablas
\dt

-- Ver usuarios (si ejecutaste seed-data.sql)
SELECT email, full_name, role FROM profiles;

-- Ver facturas
SELECT service_type, total_amount, status FROM utility_bills;

-- Salir
\q
```

---

## 📊 Estructura de la Base de Datos

### Tabla: profiles
- id (UUID)
- email
- full_name
- role ('basic_user' | 'area_coordinator')
- password_hash (encriptado con bcrypt)
- department
- location
- created_at, updated_at

### Tabla: utility_bills
- id (UUID)
- user_id (FK → profiles)
- service_type ('electricity', 'water', 'gas', etc.)
- provider
- total_amount
- period (formato: 'YYYY-MM')
- status ('draft', 'pending', 'approved', 'overdue', 'paid')
- due_date
- Y muchos más campos...

---

## 🔐 Funciones Útiles Creadas

### Registrar un nuevo usuario:
```sql
SELECT register_user(
  'nuevo@email.com',
  'password123',
  'Nombre Completo',
  'Ubicación'
);
```

### Verificar credenciales:
```sql
SELECT * FROM verify_credentials(
  'admin@apppagos.com',
  'admin123'
);
```

---

## 🚨 Si Algo No Funciona

### Error: "relation does not exist"
Vuelve a ejecutar el script de configuración:
```bash
psql -U postgres -d apppagos -f database/setup-local-postgres.sql
```

### Error de conexión en la aplicación
Verifica que:
1. PostgreSQL está corriendo
2. El archivo `.env` existe y tiene la contraseña correcta
3. La base de datos `apppagos` existe

### Ver logs de PostgreSQL
```bash
# Windows
Get-Content "C:\Program Files\PostgreSQL\17\data\log\*.log" -Tail 50
```

---

## 📈 Comandos Útiles de PostgreSQL

```sql
-- Ver todas las bases de datos
\l

-- Conectarse a apppagos
\c apppagos

-- Ver todas las tablas
\dt

-- Describir una tabla
\d profiles

-- Ver extensiones instaladas
\dx

-- Ver estadísticas de uso
SELECT * FROM pg_stat_user_tables;
```

---

## 🌐 Migración Futura a Neon (Producción)

Cuando estés listo para producción:

1. Crea cuenta en [Neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Ejecuta el mismo script:
   ```bash
   psql postgresql://usuario:pass@ep-proyecto.neon.tech/neondb -f setup-local-postgres.sql
   ```
4. Actualiza `.env.production`:
   ```env
   DATABASE_URL=postgresql://usuario:pass@ep-proyecto.neon.tech/neondb?sslmode=require
   ```

---

## ✅ Checklist Final

- [x] PostgreSQL 17 instalado
- [x] Base de datos `apppagos` creada
- [x] Tablas creadas exitosamente
- [ ] Archivo `.env` creado y configurado
- [ ] Datos de prueba insertados (opcional)
- [ ] Aplicación ejecutándose con `npm run dev`

---

## 🎯 Resumen de Archivos Importantes

```
project/
├── .env                           ← CREAR ESTE ARCHIVO
├── database/
│   ├── setup-local-postgres.sql   ← Ya ejecutado ✅
│   ├── seed-data.sql              ← Opcional
│   └── README.md                  ← Documentación completa
├── PROXIMOS_PASOS.md              ← Este archivo
└── package.json
```

---

**🚀 ¡Tu base de datos está lista! Solo falta crear el `.env` y ejecutar la app!**

¿Necesitas ayuda con alguno de los pasos siguientes?

