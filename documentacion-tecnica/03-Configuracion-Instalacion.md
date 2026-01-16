# Configuración e Instalación - APPpagos

## Requisitos Previos

Antes de instalar el sistema, asegúrate de tener instalado:

### Software Necesario
- **Node.js**: Versión 18 o superior
- **npm**: Versión 9 o superior (viene con Node.js)
- **PostgreSQL**: Versión 14 o superior (o acceso a Supabase)
- **Git**: Para clonar el repositorio (opcional)

### Cuentas y Servicios
- **Cuenta de Supabase**: Para base de datos y almacenamiento
- **Proveedor de Email**: SendGrid, Mailgun, Resend o Gmail (para notificaciones)

## Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto

Si tienes acceso al repositorio:
```bash
git clone <url-del-repositorio>
cd project
```

O simplemente navega a la carpeta del proyecto si ya la tienes.

### 2. Instalar Dependencias del Frontend

```bash
npm install
```

Esto instalará todas las dependencias necesarias para el frontend (React, TypeScript, Vite, etc.)

### 3. Instalar Dependencias del Backend

```bash
cd backend
npm install
cd ..
```

Esto instalará las dependencias del servidor (Express, PostgreSQL, JWT, etc.)

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_base_datos
# O usar variables individuales:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apppagos
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Supabase (si usas Supabase)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Backend
PORT=3000
JWT_SECRET=tu_secret_key_muy_seguro_cambiar_en_produccion
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000

# Email (elige uno de los proveedores)
# Opción 1: SendGrid
SENDGRID_API_KEY=tu_api_key

# Opción 2: Mailgun
MAILGUN_API_KEY=tu_api_key
MAILGUN_DOMAIN=tu_dominio

# Opción 3: Resend
RESEND_API_KEY=tu_api_key

# Opción 4: Gmail (Nodemailer)
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password

# Email genérico
EMAIL_FROM=noreply@apppagos.com
EMAIL_FROM_NAME=APPpagos Sistema
```

### 5. Configurar Base de Datos

#### Opción A: PostgreSQL Local

1. Crea la base de datos:
```sql
CREATE DATABASE apppagos;
```

2. Ejecuta el script de configuración:
```bash
psql -U postgres -d apppagos -f database/setup-local-postgres.sql
```

3. (Opcional) Carga datos de prueba:
```bash
psql -U postgres -d apppagos -f database/seed-data.sql
```

#### Opción B: Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a SQL Editor y ejecuta el script de migración:
   - `supabase/migrations/20251001212345_create_utility_bills_schema.sql`
3. Configura las variables de entorno con las credenciales de Supabase

### 6. Iniciar el Servidor de Desarrollo

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

#### Terminal 2 - Frontend:
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### 7. Verificar la Instalación

1. Abre el navegador en `http://localhost:5173`
2. Deberías ver la página de inicio de sesión
3. Si cargaste datos de prueba, puedes iniciar sesión con:
   - Email: `admin@apppagos.com`
   - Contraseña: `admin123`

## Configuración Detallada

### Configuración de PostgreSQL Local

Si usas PostgreSQL local, asegúrate de:

1. **PostgreSQL está corriendo**:
   ```bash
   # Windows (PowerShell)
   Get-Service postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. **Verificar conexión**:
   ```bash
   psql -U postgres -d apppagos -c "SELECT 1;"
   ```

3. **Configurar SSL** (si es necesario):
   En el archivo `.env`, ajusta la configuración SSL según tu entorno.

### Configuración de Supabase

1. **Obtener credenciales**:
   - Ve a tu proyecto en Supabase
   - Settings → API
   - Copia la URL y las keys

2. **Configurar Storage**:
   - Ve a Storage en Supabase
   - Crea un bucket llamado `invoices` (o el nombre que prefieras)
   - Configura las políticas de acceso según tus necesidades

3. **Configurar RLS**:
   - Las políticas de Row Level Security ya están incluidas en las migraciones
   - Verifica que estén activas en Supabase Dashboard

### Configuración de Email

El sistema soporta múltiples proveedores de email. Solo necesitas configurar uno:

#### SendGrid
1. Crea cuenta en [sendgrid.com](https://sendgrid.com)
2. Genera una API Key
3. Agrega `SENDGRID_API_KEY` a tu `.env`

#### Mailgun
1. Crea cuenta en [mailgun.com](https://mailgun.com)
2. Verifica tu dominio
3. Obtén tu API Key
4. Agrega `MAILGUN_API_KEY` y `MAILGUN_DOMAIN` a tu `.env`

#### Resend
1. Crea cuenta en [resend.com](https://resend.com)
2. Obtén tu API Key
3. Agrega `RESEND_API_KEY` a tu `.env`

#### Gmail (Nodemailer)
1. Habilita la verificación en 2 pasos en tu cuenta de Gmail
2. Genera una "Contraseña de aplicación"
3. Agrega `GMAIL_USER` y `GMAIL_APP_PASSWORD` a tu `.env`

## Solución de Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `.env`
- Verifica que la base de datos exista
- Comprueba que el puerto sea correcto (5432 por defecto)

### Error: "Port 3000 already in use"
- Cambia el puerto en `.env`: `PORT=3001`
- Actualiza `VITE_API_URL` en `.env`: `VITE_API_URL=http://localhost:3001`

### Error: "JWT_SECRET is not defined"
- Agrega `JWT_SECRET` a tu archivo `.env`
- Usa una cadena larga y aleatoria para producción

### Error: "Module not found"
- Ejecuta `npm install` en la raíz del proyecto
- Ejecuta `npm install` en la carpeta `backend`
- Elimina `node_modules` y `package-lock.json` y vuelve a instalar

### Error: "CORS policy"
- Verifica que `VITE_API_URL` en el frontend coincida con el puerto del backend
- En desarrollo, CORS está habilitado por defecto

### Error al subir archivos
- Verifica que Supabase Storage esté configurado
- Comprueba que `SUPABASE_SERVICE_ROLE_KEY` esté correcto
- Verifica que el bucket exista y tenga permisos adecuados

## Comandos Útiles

### Desarrollo
```bash
# Iniciar solo frontend
npm run dev

# Iniciar solo backend
cd backend && npm run dev

# Iniciar ambos (requiere concurrently)
npm run dev:all
```

### Producción
```bash
# Construir frontend
npm run build

# Iniciar backend en producción
cd backend && npm start
```

### Base de Datos
```bash
# Ejecutar migraciones
psql -U postgres -d apppagos -f supabase/migrations/20251001212345_create_utility_bills_schema.sql

# Cargar datos de prueba
psql -U postgres -d apppagos -f database/seed-data.sql
```

## Próximos Pasos

Una vez instalado y configurado:
1. Revisa la [documentación de la API](05-API-Endpoints.md)
2. Consulta la [documentación de seguridad](06-Seguridad-Autenticacion.md)
3. Lee sobre el [despliegue en producción](07-Despliegue-Produccion.md)

