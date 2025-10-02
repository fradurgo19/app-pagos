# 🔐 Migración a Autenticación Local Completada

## ✅ Cambios Realizados

La aplicación ahora usa **autenticación local con PostgreSQL** en lugar de Supabase Auth.

---

## 🏗️ Nueva Arquitectura

```
Frontend (React)
    ↓
Backend API (Express)
    ↓
PostgreSQL Local (Auth + Datos)
```

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:

1. **`backend/server.js`** (200+ líneas)
   - Servidor Express
   - Rutas de autenticación (signup, login, profile)
   - Integración con PostgreSQL
   - JWT para tokens de sesión

2. **`backend/package.json`**
   - Dependencias del backend

### Archivos Modificados:

3. **`src/services/authService.ts`**
   - Ahora usa API local en lugar de Supabase
   - Almacena tokens en localStorage
   - Maneja autenticación con JWT

4. **`package.json`** (raíz)
   - Nuevos scripts para ejecutar backend
   - Dependencia `concurrently` agregada

5. **`.env.example`**
   - Variables para API local
   - DATABASE_URL
   - JWT_SECRET

---

## 🚀 Pasos para Ejecutar

### 1. Instalar Dependencias del Backend

```powershell
cd backend
npm install
cd ..
```

### 2. Actualizar archivo `.env`

Agrega estas variables a tu `.env` en la raíz:

```env
# API Backend Local
VITE_API_URL=http://localhost:3000

# PostgreSQL Local
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/apppagos

# JWT Secret
JWT_SECRET=mi-secreto-super-seguro-cambiar-en-produccion

# Supabase (OPCIONAL - solo si quieres usar storage)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

**IMPORTANTE:** Reemplaza `tu_password` con tu contraseña de PostgreSQL.

### 3. Instalar `concurrently` (para ejecutar frontend y backend juntos)

```powershell
npm install
```

### 4. Ejecutar Frontend y Backend Juntos

**Opción A: Comando único (Recomendado)**
```powershell
npm run dev:all
```

**Opción B: Terminales separadas**

Terminal 1 (Backend):
```powershell
npm run dev:backend
```

Terminal 2 (Frontend):
```powershell
npm run dev
```

---

## 🎯 URLs de la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

---

## 🔐 Endpoints de API Creados

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/signup` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/profile` | Obtener perfil (requiere auth) |
| GET | `/api/auth/verify` | Verificar token (requiere auth) |

### Health Check

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |

---

## 👥 Usuarios de Prueba (seed-data.sql)

Ahora puedes usar los usuarios que creaste con `seed-data.sql`:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@apppagos.com | admin123 | Coordinador de Área |
| usuario1@apppagos.com | user123 | Usuario Básico |
| usuario2@apppagos.com | user123 | Usuario Básico |

---

## ✅ Verificar que Funciona

### 1. Verificar Backend

```powershell
# Debe responder con status "ok"
curl http://localhost:3000/api/health
```

O abre en el navegador: http://localhost:3000/api/health

### 2. Probar Login

Abre http://localhost:5173/login e inicia sesión con:
- **Email**: admin@apppagos.com
- **Contraseña**: admin123

### 3. Verificar Token

Después de login exitoso:
1. Abre DevTools (F12)
2. Ve a Application → Local Storage
3. Deberías ver `auth_token` con un JWT

---

## 🔧 Cómo Funciona

### 1. Registro (Signup)
```
Frontend → POST /api/auth/signup
    ↓
Backend llama a register_user() en PostgreSQL
    ↓
PostgreSQL crea usuario con password encriptado
    ↓
Backend genera JWT token
    ↓
Frontend guarda token en localStorage
```

### 2. Login
```
Frontend → POST /api/auth/login
    ↓
Backend llama a verify_credentials() en PostgreSQL
    ↓
PostgreSQL verifica password con bcrypt
    ↓
Backend genera JWT token
    ↓
Frontend guarda token en localStorage
```

### 3. Peticiones Autenticadas
```
Frontend envía: Authorization: Bearer <token>
    ↓
Backend verifica JWT
    ↓
Si válido → procesa petición
Si inválido → 401/403
```

---

## 📊 Funciones PostgreSQL Usadas

El backend usa las funciones SQL que creamos:

```sql
-- Para registro
SELECT register_user($1, $2, $3, $4)

-- Para login
SELECT * FROM verify_credentials($1, $2)
```

Estas funciones manejan:
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de credenciales
- ✅ Creación de usuarios

---

## 🔐 Seguridad Implementada

✅ **Contraseñas encriptadas** con bcrypt (función PostgreSQL `crypt()`)
✅ **JWT tokens** para sesiones
✅ **CORS** habilitado para desarrollo
✅ **Validaciones** de entrada
✅ **Middleware de autenticación** en rutas protegidas

---

## 🚨 Solución de Problemas

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL está corriendo:
   ```powershell
   Get-Service postgresql*
   ```

2. Verifica el `DATABASE_URL` en `.env`

3. Prueba la conexión:
   ```powershell
   psql -U postgres -d apppagos -c "SELECT 1;"
   ```

### Error: "JWT_SECRET is not defined"

Agrega `JWT_SECRET` a tu `.env`:
```env
JWT_SECRET=mi-secreto-super-seguro
```

### Error: "Port 3000 is in use"

Cambia el puerto en `.env`:
```env
PORT=3001
VITE_API_URL=http://localhost:3001
```

### Backend no inicia

```powershell
cd backend
npm install
npm run dev
```

### Credenciales inválidas

Si usaste `seed-data.sql`, los usuarios deberían funcionar.

Verifica en PostgreSQL:
```sql
psql -U postgres -d apppagos

SELECT email FROM profiles;
```

---

## 🎯 Ventajas de Esta Arquitectura

✅ **Control total** de la autenticación
✅ **Sin dependencias externas** (Supabase Auth)
✅ **Datos locales** - todo en PostgreSQL
✅ **Fácil debugging** - código propio
✅ **Personalizable** - puedes modificar todo
✅ **Funciona offline** - no requiere internet

---

## 🔄 Migrar de Supabase a Local

Si tenías usuarios en Supabase y quieres migrarlos:

1. Exporta usuarios de Supabase
2. Crea script de migración
3. Inserta en PostgreSQL local

O simplemente usa `seed-data.sql` para crear usuarios de prueba.

---

## 📈 Próximos Pasos Opcionales

### Mejorar Seguridad (Producción):

1. **Variables de entorno seguras**
   ```env
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Rate limiting**
   ```bash
   npm install express-rate-limit
   ```

3. **HTTPS** (en producción)

4. **Refresh tokens** (JWT de larga duración)

5. **Blacklist de tokens** (para logout efectivo)

---

## 📝 Estructura Final

```
project/
├── backend/                 ← NUEVO
│   ├── server.js           ← API Express
│   ├── package.json        ← Dependencias backend
│   └── node_modules/       ← (después de npm install)
├── src/
│   └── services/
│       └── authService.ts  ← MODIFICADO (usa API local)
├── database/
│   ├── setup-local-postgres.sql  ← Ya ejecutado
│   └── seed-data.sql             ← Usuarios de prueba
├── .env                    ← Actualizar con nuevas vars
└── package.json            ← MODIFICADO (nuevos scripts)
```

---

## ✅ Checklist de Migración

- [x] Backend API creado
- [x] authService modificado
- [x] Scripts de npm actualizados
- [ ] Dependencias del backend instaladas (`cd backend && npm install`)
- [ ] Archivo `.env` actualizado con nuevas variables
- [ ] Concurrently instalado (`npm install`)
- [ ] Backend ejecutándose en puerto 3000
- [ ] Frontend ejecutándose en puerto 5173
- [ ] Login funcionando con usuarios de prueba

---

**🎉 ¡Autenticación local completada!**

Ejecuta `npm run dev:all` y prueba login con:
- Email: admin@apppagos.com
- Password: admin123

