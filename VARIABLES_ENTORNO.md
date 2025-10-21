# 📝 Guía de Variables de Entorno

## 📂 Estructura de Archivos .env

Tu proyecto necesita **DOS archivos .env separados**:

```
project/
├── .env                    ← Variables del FRONTEND
└── backend/
    └── .env                ← Variables del BACKEND
```

---

## 1️⃣ **Archivo: `.env` (en la RAÍZ del proyecto)**

📁 Ubicación: `C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project\.env`

**Contenido CORRECTO:**

```env
# Variables del Frontend (React + Vite)
# SOLO variables con prefijo VITE_

VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://rafmynmmenebreqeagvm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZm15bm1tZW5lYnJlcWVhZ3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTAxNjQsImV4cCI6MjA3NDkyNjE2NH0.lVg3AcX3Ki31GEKoDRdDXxO4sV0Um4a2vjaw2iVOXQE
```

✅ **Solo 3 variables** (todas con prefijo VITE_)

---

## 2️⃣ **Archivo: `backend/.env` (dentro de la carpeta backend)**

📁 Ubicación: `C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project\backend\.env`

**Contenido CORRECTO:**

```env
# Variables del Backend (Express + Node.js)
# SIN variables VITE_

# Base de datos PostgreSQL
DATABASE_URL=postgresql://postgres:TU_PASSWORD_POSTGRES@localhost:5432/apppagos

# Configuración de Correo Electrónico
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=Fradurgo19.$
EMAIL_TO=fherrera@partequipos.com

# JWT Secret
JWT_SECRET=tu-secret-key-muy-seguro-cambiar-en-produccion

# Puerto del servidor backend
PORT=3000

# Entorno
NODE_ENV=development
```

✅ **Sin variables VITE_** (esas van en la raíz)
⚠️ **Reemplaza `TU_PASSWORD_POSTGRES` con tu contraseña real de PostgreSQL**

---

## 🔧 **Acción Requerida**

### **En tu `backend/.env` actual:**

**❌ QUITAR estas líneas:**
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://rafmynmmenebreqeagvm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**✅ MANTENER solo:**
```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD_AQUI@localhost:5432/apppagos
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=Fradurgo19.$
EMAIL_TO=fherrera@partequipos.com
JWT_SECRET=tu-secret-key-muy-seguro-cambiar-en-produccion
PORT=3000
NODE_ENV=development
```

**✅ ACTUALIZAR:**
Cambia `TU_PASSWORD_AQUI` por tu contraseña real de PostgreSQL

---

## 📋 **Checklist de Configuración**

### Backend (.env en carpeta backend):
- [ ] DATABASE_URL configurado con tu contraseña de PostgreSQL
- [ ] EMAIL_USER = analista.mantenimiento@partequipos.com
- [ ] EMAIL_PASSWORD = Fradurgo19.$
- [ ] EMAIL_TO = fherrera@partequipos.com
- [ ] JWT_SECRET configurado
- [ ] PORT = 3000
- [ ] NODE_ENV = development
- [ ] **SIN variables VITE_***

### Frontend (.env en raíz):
- [ ] VITE_API_URL = http://localhost:3000
- [ ] VITE_SUPABASE_URL configurado
- [ ] VITE_SUPABASE_ANON_KEY configurado

---

## 🎯 **Ejemplo Completo**

### `backend/.env` ✅ CORRECTO:
```env
DATABASE_URL=postgresql://postgres:MiPassword123@localhost:5432/apppagos
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=Fradurgo19.$
EMAIL_TO=fherrera@partequipos.com
JWT_SECRET=mi-clave-secreta-super-segura-12345
PORT=3000
NODE_ENV=development
```

### `backend/.env` ❌ INCORRECTO:
```env
VITE_API_URL=http://localhost:3000  ← NO VA AQUÍ
VITE_SUPABASE_URL=...               ← NO VA AQUÍ
DATABASE_URL=...
EMAIL_USER=...
```

---

## 🚀 **Después de Configurar**

1. **Guarda los cambios** en `backend/.env`
2. **Reinicia el servidor:**
   ```powershell
   npm run dev:all
   ```
3. **Verifica los mensajes:**
   ```
   ✅ Servidor de correo configurado correctamente
   ```

---

¿Necesitas ayuda para editar el archivo `backend/.env`? 😊

