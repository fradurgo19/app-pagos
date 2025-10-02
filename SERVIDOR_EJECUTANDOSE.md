# 🚀 Servidor de Desarrollo Ejecutándose

## ✅ La aplicación está corriendo!

### 📍 URL de Acceso:

**Frontend (React + Vite):**
```
http://localhost:5173
```

Abre tu navegador y ve a: **http://localhost:5173**

---

## 🎯 ¿Qué está corriendo?

### Frontend (Vite Dev Server)
- ✅ React 18
- ✅ TypeScript
- ✅ TailwindCSS
- ✅ React Router
- ✅ Puerto: 5173

### Backend (PostgreSQL 17)
- ✅ Base de datos: `apppagos`
- ✅ Puerto: 5432 (localhost)
- ✅ 5 tablas configuradas
- ✅ Datos de prueba (si los insertaste)

### Auth & Storage (Supabase)
- ✅ Autenticación
- ✅ Storage de archivos
- ✅ Conectado a tu proyecto

---

## 👥 Usuarios de Prueba (si ejecutaste seed-data.sql)

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@apppagos.com | admin123 | Coordinador de Área |
| usuario1@apppagos.com | user123 | Usuario Básico |
| usuario2@apppagos.com | user123 | Usuario Básico |

---

## 🎨 Páginas Disponibles:

1. **Login**: `http://localhost:5173/login`
2. **Registro**: `http://localhost:5173/signup`
3. **Panel de Control**: `http://localhost:5173/` (requiere login)
4. **Facturas**: `http://localhost:5173/bills` (requiere login)
5. **Nueva Factura**: `http://localhost:5173/new-bill` (requiere login)

---

## 🛠️ Comandos Útiles

### Ver logs del servidor:
El servidor está corriendo en segundo plano. Para ver los logs en tiempo real:
```powershell
# El servidor ya está corriendo, solo abre http://localhost:5173
```

### Detener el servidor:
```powershell
# Presiona Ctrl+C en la terminal donde está corriendo
# O cierra la terminal
```

### Reiniciar el servidor:
```powershell
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"
npm run dev
```

---

## 🔍 Verificar que todo funciona:

### 1. Frontend
- Abre: http://localhost:5173
- Deberías ver la página de login

### 2. Base de Datos
```powershell
psql -U postgres -d apppagos -c "SELECT COUNT(*) FROM profiles;"
```
Debería mostrar el número de usuarios

### 3. Supabase
- Las credenciales están configuradas en `.env`
- La autenticación funcionará cuando te registres

---

## 📊 Estado del Proyecto:

```
✅ Frontend: CORRIENDO en http://localhost:5173
✅ Backend (PostgreSQL): LISTO en localhost:5432
✅ Base de Datos: apppagos
✅ Tablas: 5 tablas creadas
✅ Supabase: Configurado
✅ Traducción: 100% Español
```

---

## 🎯 Primeros Pasos en la App:

### Opción 1: Usar datos de prueba
Si ejecutaste `seed-data.sql`:
1. Ve a http://localhost:5173/login
2. Inicia sesión con: `admin@apppagos.com` / `admin123`
3. Explora el dashboard con facturas de ejemplo

### Opción 2: Registrar nuevo usuario
1. Ve a http://localhost:5173/signup
2. Crea tu cuenta
3. Inicia sesión
4. Crea tu primera factura

---

## 🚨 Si algo no funciona:

### Error: "Cannot connect to database"
1. Verifica que PostgreSQL está corriendo:
   ```powershell
   Get-Service postgresql*
   ```
2. Verifica el `.env` tiene la contraseña correcta

### Error: "Supabase error"
1. Verifica las credenciales en `.env`
2. Ve a https://app.supabase.com y verifica tu proyecto

### Página en blanco
1. Abre la consola del navegador (F12)
2. Revisa errores en la pestaña "Console"
3. Verifica que el servidor está corriendo en http://localhost:5173

### Puerto 5173 ocupado
El servidor usará automáticamente otro puerto (5174, 5175, etc.)
Revisa la terminal para ver qué puerto está usando.

---

## 🔧 Desarrollo:

### Hot Reload Activado ✅
Cualquier cambio en el código se reflejará automáticamente en el navegador.

### TypeScript Check:
```bash
npm run typecheck
```

### Linting:
```bash
npm run lint
```

### Build para Producción:
```bash
npm run build
```

Los archivos se generarán en `/dist`

---

## 🌐 Estructura de la App:

```
Frontend (React)
  ↓
Supabase (Auth)
  ↓
PostgreSQL Local (Datos)
```

- **Autenticación**: Supabase
- **Datos de facturas**: PostgreSQL local
- **Storage de archivos**: Supabase Storage

---

## 📝 Logs y Debugging:

### Ver logs del navegador:
1. Abre http://localhost:5173
2. Presiona F12
3. Ve a la pestaña "Console"

### Ver logs de PostgreSQL:
```powershell
Get-Content "C:\Program Files\PostgreSQL\17\data\log\*.log" -Tail 50
```

### Ver estado de la base de datos:
```sql
psql -U postgres -d apppagos

-- Ver tablas
\dt

-- Ver usuarios
SELECT email, role FROM profiles;

-- Ver facturas
SELECT service_type, total_amount, status FROM utility_bills;
```

---

## 🎉 ¡Todo Listo!

Tu aplicación de gestión de facturas está corriendo completamente en español con:

- ✅ Frontend moderno (React + Vite)
- ✅ Base de datos local (PostgreSQL 17)
- ✅ Autenticación segura (Supabase)
- ✅ Interfaz completamente en español
- ✅ Formato de moneda colombiano (COP)
- ✅ Diseño profesional con TailwindCSS

**Abre tu navegador y ve a: http://localhost:5173**

¡Disfruta tu aplicación! 🚀

