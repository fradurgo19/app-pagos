# 🚀 Cómo Ejecutar Frontend y Backend

## 📋 Antes de Empezar

### ⚠️ IMPORTANTE: Actualizar Contraseña

Abre el archivo `.env` y cambia `TU_PASSWORD` por tu contraseña real de PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA_REAL@localhost:5432/apppagos
```

---

## 🎯 Opción 1: Todo en Una Terminal (Recomendado)

Abre PowerShell o CMD y ejecuta:

```powershell
# Navegar al proyecto
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"

# Ejecutar frontend y backend juntos
npm run dev:all
```

Deberías ver algo como:

```
[0] > apppagos-utility-bill-manager@1.0.0 dev
[0] > vite
[1] > apppagos-backend@1.0.0 dev
[1] > nodemon server.js
[1] 🚀 Servidor backend ejecutándose en http://localhost:3000
[0]   VITE v5.4.8  ready in 534 ms
[0]   ➜  Local:   http://localhost:5173/
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

**Para detener:** Presiona `Ctrl+C`

---

## 🎯 Opción 2: Terminales Separadas (Más Control)

### Terminal 1 - Backend

```powershell
# Navegar al proyecto
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"

# Ejecutar backend
npm run dev:backend
```

Deberías ver:
```
🚀 Servidor backend ejecutándose en http://localhost:3000
📊 Base de datos: PostgreSQL Local
🔐 Autenticación: JWT
```

### Terminal 2 - Frontend

Abre **OTRA terminal** y ejecuta:

```powershell
# Navegar al proyecto
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"

# Ejecutar frontend
npm run dev
```

Deberías ver:
```
  VITE v5.4.8  ready in 534 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ Verificar que Funciona

### 1. Verificar Backend (API)

Abre el navegador y ve a:
```
http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-01-..."
}
```

Si ves `"database": "disconnected"`, revisa tu contraseña en `.env`.

### 2. Verificar Frontend

Abre:
```
http://localhost:5173
```

Deberías ver la página de Login.

### 3. Probar Login

1. Ve a http://localhost:5173/login
2. Ingresa:
   - **Email**: admin@apppagos.com
   - **Password**: admin123
3. Click en "Iniciar Sesión"
4. ¡Deberías entrar al Dashboard!

---

## 🔍 Logs en Tiempo Real

Los logs aparecerán en la terminal:

**Backend (Puerto 3000):**
```
🚀 Servidor backend ejecutándose en http://localhost:3000
📊 Base de datos: PostgreSQL Local
🔐 Autenticación: JWT
POST /api/auth/login 200 123ms
GET /api/auth/profile 200 45ms
```

**Frontend (Puerto 5173):**
```
  VITE v5.4.8  ready in 534 ms
  ➜  Local:   http://localhost:5173/
  ready in 123 ms
```

---

## 🛑 Detener los Servidores

### Si usaste Opción 1 (una terminal):
- Presiona `Ctrl+C` en la terminal
- Confirma con `S` si te pregunta

### Si usaste Opción 2 (dos terminales):
- Presiona `Ctrl+C` en cada terminal
- Cierra las terminales

---

## 🔄 Reiniciar los Servidores

Si haces cambios en el código:

**Frontend (Vite)**: Se recarga automáticamente (Hot Reload) ✅

**Backend (Nodemon)**: Se reinicia automáticamente ✅

No necesitas hacer nada, los cambios se reflejan automáticamente.

---

## 📊 Estructura de Ejecución

```
Terminal
   ↓
npm run dev:all
   ↓
   ├── Frontend (Vite)     → http://localhost:5173
   │   ├── React App
   │   ├── Hot Reload
   │   └── TypeScript
   │
   └── Backend (Express)   → http://localhost:3000
       ├── API REST
       ├── JWT Auth
       ├── PostgreSQL
       └── Nodemon (auto-restart)
```

---

## 🚨 Solución de Problemas

### Error: "Cannot find module"

**Solución:**
```powershell
npm install
cd backend
npm install
cd ..
```

### Error: "Port 3000 is already in use"

**Solución:**
```powershell
# Matar proceso en puerto 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Reintentar
npm run dev:all
```

### Error: "Port 5173 is already in use"

**Solución:**
```powershell
# Matar proceso en puerto 5173
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force

# Reintentar
npm run dev:all
```

### Error: "Cannot connect to database"

**Solución:**

1. Verifica que PostgreSQL está corriendo:
   ```powershell
   Get-Service postgresql*
   ```

2. Verifica tu `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/apppagos
   ```

3. Prueba la conexión:
   ```powershell
   psql -U postgres -d apppagos -c "SELECT 1;"
   ```

### Error: "Credenciales inválidas" al hacer login

**Verifica que existen los usuarios:**
```powershell
psql -U postgres -d apppagos -c "SELECT email FROM profiles;"
```

**Si no hay usuarios, ejecuta:**
```powershell
cd database
psql -U postgres -d apppagos -f seed-data.sql
cd ..
```

---

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Solo frontend (Vite) |
| `npm run dev:backend` | Solo backend (Express) |
| `npm run dev:all` | Frontend + Backend juntos |
| `npm run build` | Compilar frontend para producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Verificar código con ESLint |
| `npm run typecheck` | Verificar tipos TypeScript |

---

## 🎯 Flujo de Trabajo Recomendado

### Para Desarrollo Diario:

1. **Abrir terminal**
2. **Navegar al proyecto:**
   ```powershell
   cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"
   ```
3. **Ejecutar todo:**
   ```powershell
   npm run dev:all
   ```
4. **Abrir navegador:**
   - http://localhost:5173
5. **Desarrollar** (los cambios se reflejan automáticamente)
6. **Al terminar:** `Ctrl+C`

---

## 🌐 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación React |
| **Login** | http://localhost:5173/login | Página de login |
| **Dashboard** | http://localhost:5173/ | Panel principal |
| **Backend** | http://localhost:3000 | API REST |
| **Health Check** | http://localhost:3000/api/health | Estado del servidor |

---

## 👥 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@apppagos.com | admin123 | Coordinador de Área |
| usuario1@apppagos.com | user123 | Usuario Básico |
| usuario2@apppagos.com | user123 | Usuario Básico |

---

## 🎨 Ejemplo de Sesión Completa

```powershell
# 1. Abrir PowerShell
PS C:\Users\Frank Duran>

# 2. Ir al proyecto
PS C:\Users\Frank Duran> cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"

# 3. Ejecutar
PS C:\...\project> npm run dev:all

# Verás:
[0] > vite
[1] > nodemon server.js
[1] 🚀 Servidor backend ejecutándose en http://localhost:3000
[0]   ➜  Local:   http://localhost:5173/

# 4. Abrir navegador: http://localhost:5173
# 5. Login con: admin@apppagos.com / admin123
# 6. ¡Listo! Estás dentro

# Para detener:
# Presiona Ctrl+C
```

---

## 🎉 ¡Todo Listo!

Ahora puedes ejecutar la aplicación completa con:

```powershell
npm run dev:all
```

Y acceder en: **http://localhost:5173**

---

**¿Necesitas más ayuda?** Revisa los archivos de documentación:
- `INSTRUCCIONES_FINALES.md`
- `MIGRACION_AUTH_LOCAL.md`
- `database/README.md`

