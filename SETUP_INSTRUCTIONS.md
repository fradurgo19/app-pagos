# 📝 Instrucciones de Configuración - APPpagos

## 🚀 Pasos para Configurar el Proyecto

### 1️⃣ **Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

**¿Dónde obtener estas credenciales?**
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

### 2️⃣ **Instalar Dependencias**

Asegúrate de tener Node.js 18+ instalado, luego ejecuta:

```bash
npm install
```

---

### 3️⃣ **Configurar Base de Datos en Supabase**

#### Opción A: Desde el Dashboard de Supabase
1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido de `supabase/migrations/20251001212345_create_utility_bills_schema.sql`
3. Ejecuta el script

#### Opción B: Usando Supabase CLI (recomendado)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref tu-project-ref

# Aplicar migraciones
supabase db push
```

---

### 4️⃣ **Inicializar Git (si aún no lo has hecho)**

```bash
# Asegúrate de estar en el directorio del proyecto
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\APPpagos\project"

# Inicializar repositorio
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit: Sistema de gestión de facturas"
```

---

### 5️⃣ **Ejecutar en Desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

### 6️⃣ **Construir para Producción**

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

---

## 🚀 Despliegue en Vercel

### Configuración Inicial

1. **Instalar Vercel CLI (opcional)**
```bash
npm install -g vercel
```

2. **Desde la interfaz web de Vercel:**
   - Ve a https://vercel.com
   - Conecta tu repositorio GitHub
   - Configura las variables de entorno:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Despliega

3. **Desde la CLI:**
```bash
vercel login
vercel --prod
```

### Variables de Entorno en Vercel

En el dashboard de Vercel:
1. Proyecto → **Settings** → **Environment Variables**
2. Agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu clave anónima

---

## 🧪 Testing y Validación

### Verificar TypeScript
```bash
npm run typecheck
```

### Verificar ESLint
```bash
npm run lint
```

---

## 👥 Crear Usuario de Prueba

1. Inicia la aplicación
2. Ve a `/signup`
3. Registra un usuario:
   - Email: tu@email.com
   - Password: mínimo 6 caracteres
   - Nombre completo
   - Ubicación

### Crear Coordinador de Área

Para probar funcionalidades de coordinador:

```sql
-- Ejecuta esto en el SQL Editor de Supabase
UPDATE profiles 
SET role = 'area_coordinator' 
WHERE email = 'tu@email.com';
```

---

## 🔍 Verificación de Instalación

Comprueba que todo funciona:

- [ ] ✅ `npm install` sin errores
- [ ] ✅ `npm run dev` inicia sin errores
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ Puedes registrarte
- [ ] ✅ Puedes iniciar sesión
- [ ] ✅ El dashboard carga correctamente
- [ ] ✅ Puedes crear una factura

---

## ⚠️ Problemas Comunes

### Error: "Missing Supabase environment variables"
**Solución:** Verifica que existe el archivo `.env` con las credenciales correctas

### Error: "Failed to fetch"
**Solución:** 
1. Verifica que las credenciales en `.env` son correctas
2. Verifica que la base de datos está configurada (ejecutaste el script SQL)
3. Verifica que estás conectado a internet

### Error: Infinite re-renders
**Solución:** Ya corregido en la última versión. Actualiza desde GitHub.

### Error de CORS
**Solución:** Verifica en Supabase → **Authentication** → **URL Configuration** que tu localhost está permitido

---

## 📞 Soporte

Para problemas adicionales:
1. Revisa los logs en consola del navegador (F12)
2. Revisa los logs de Supabase (Dashboard → Logs)
3. Verifica que todas las dependencias están instaladas

---

## 🎯 Próximos Pasos

Una vez configurado:
1. Personaliza los colores en `tailwind.config.js`
2. Agrega tu logo en la navbar
3. Configura tus ubicaciones y centros de costo
4. Invita a tu equipo

