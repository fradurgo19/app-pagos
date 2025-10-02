# 🚀 Guía de Migración a Producción

## 🎯 Arquitectura de Producción

```
Frontend → Vercel (https://tu-app.vercel.app)
    ↓
Backend → Vercel Serverless Functions
    ↓
Base de Datos → Supabase PostgreSQL
    ↓
Storage → Supabase Storage
```

---

## 📋 FASE 1: Preparar Supabase

### 1.1 Crear Proyecto en Supabase

1. Ve a: https://supabase.com
2. Click en "Start your project"
3. Crea una organización
4. Crea un nuevo proyecto:
   - **Nombre**: APPpagos
   - **Database Password**: (guárdala bien)
   - **Región**: South America (São Paulo) - más cercana a Colombia
5. Espera 2-3 minutos a que se aprovisione

### 1.2 Migrar el Schema de Base de Datos

**Opción A: Desde el SQL Editor de Supabase**

1. En Supabase → SQL Editor → New query
2. Copia y pega el contenido de: `database/setup-local-postgres.sql`
3. **IMPORTANTE**: Elimina las líneas que crean la tabla `profiles` 
   (Supabase ya tiene su propia tabla auth.users)
4. Ejecuta el script
5. ✅ Verificar que se crearon las tablas

**Opción B: Desde tu terminal**

```bash
# Obtén la connection string de Supabase
# Supabase → Settings → Database → Connection string → URI

psql "postgresql://postgres:[TU-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f database/setup-local-postgres.sql
```

### 1.3 Migrar Datos (si tienes datos reales)

```bash
# Exportar desde PostgreSQL local
pg_dump -U postgres --data-only apppagos > data_backup.sql

# Importar a Supabase
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < data_backup.sql
```

### 1.4 Configurar Supabase Storage

1. Supabase → Storage → Create bucket
2. **Nombre del bucket**: `facturas`
3. **Public bucket**: NO (privado)
4. Click "Create bucket"

5. **Configurar políticas de seguridad**:

```sql
-- En SQL Editor de Supabase

-- Permitir upload de archivos autenticados
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'facturas' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir lectura de propios archivos
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'facturas' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir eliminación de propios archivos
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'facturas' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 📋 FASE 2: Adaptar el Backend para Supabase

### 2.1 Crear Adaptador Dual

Necesitamos que el código funcione con:
- **Local**: PostgreSQL directo
- **Producción**: Supabase

Archivo: `backend/db-adapter.js`

```javascript
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
  // Usar Supabase en producción
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Service key, NO anon key
  );
  db = supabase;
} else {
  // Usar PostgreSQL directo en desarrollo
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  });
  db = pool;
}

export default db;
```

### 2.2 Modificar Rutas para Usar Adaptador

En lugar de queries directos, usar Supabase SDK en producción.

---

## 📋 FASE 3: Configurar Vercel

### 3.1 Preparar el Proyecto

1. **Crear archivo `vercel.json`** (ya existe, vamos a actualizarlo):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. **Actualizar `package.json`**:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

### 3.2 Deploy en Vercel

**Opción A: Desde GitHub**

1. Sube tu código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/apppagos.git
   git push -u origin main
   ```

2. Ve a: https://vercel.com
3. Click "Import Project"
4. Conecta tu repositorio de GitHub
5. Click "Import"

**Opción B: CLI de Vercel**

```bash
npm install -g vercel
vercel login
vercel
# Sigue las instrucciones
```

### 3.3 Configurar Variables de Entorno en Vercel

En Vercel Dashboard → Tu proyecto → Settings → Environment Variables:

Agregar:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres | Production |
| `JWT_SECRET` | (generar uno nuevo seguro) | Production |
| `VITE_API_URL` | https://tu-app.vercel.app | Production |
| `VITE_SUPABASE_URL` | https://[REF].supabase.co | Production |
| `VITE_SUPABASE_ANON_KEY` | (tu anon key) | Production |
| `SUPABASE_SERVICE_KEY` | (service_role key) | Production |
| `NODE_ENV` | production | Production |

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 FASE 4: Implementar Upload de Archivos

### 4.1 Crear Servicio de Storage

Archivo: `src/services/storageService.ts`

```typescript
import { supabase } from '../lib/supabase';
import { authService } from './authService';

export const storageService = {
  async uploadFile(file: File, billId: string): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase Storage no está configurado');
    }

    const token = authService.getAuthToken();
    if (!token) throw new Error('No autenticado');

    // Nombre del archivo: userId/billId/filename
    const fileName = `${billId}/${file.name}`;

    const { data, error } = await supabase.storage
      .from('facturas')
      .upload(fileName, file, {
        upsert: true
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('facturas')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async deleteFile(filePath: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.storage
      .from('facturas')
      .remove([filePath]);

    if (error) throw error;
  }
};
```

### 4.2 Integrar en BillForm

Modificar `src/organisms/BillForm.tsx` para usar storage:

```typescript
// Al guardar factura con archivo
if (formData.attachedDocument) {
  const url = await storageService.uploadFile(
    formData.attachedDocument,
    createdBill.id
  );
  
  // Actualizar factura con URL del documento
  await billService.update(createdBill.id, {
    documentUrl: url,
    documentName: formData.attachedDocument.name
  });
}
```

---

## 📋 FASE 5: Testing en Producción

### 5.1 Deploy de Prueba (Staging)

1. Crea una rama `staging` en Git
2. Deploy a Vercel desde esa rama
3. Prueba todas las funcionalidades
4. Corrige bugs
5. Una vez estable → merge a `main` y deploy a producción

### 5.2 Monitoreo

En Vercel:
- Vercel Analytics (automático)
- Speed Insights
- Logs en tiempo real

En Supabase:
- Database → Logs
- API Logs
- Storage usage

---

## 🔄 PROCESO DE MIGRACIÓN COMPLETO

### Semana 1: Preparación
- [ ] Crear cuenta Supabase
- [ ] Crear proyecto Supabase
- [ ] Migrar schema
- [ ] Configurar Storage
- [ ] Testing en Supabase

### Semana 2: Adaptación de Código
- [ ] Crear adaptador de BD dual
- [ ] Modificar backend para Supabase
- [ ] Implementar upload de archivos
- [ ] Testing local con Supabase

### Semana 3: Deploy
- [ ] Subir código a GitHub
- [ ] Conectar con Vercel
- [ ] Configurar variables de entorno
- [ ] Deploy de prueba (staging)
- [ ] Testing completo en staging

### Semana 4: Producción
- [ ] Corregir bugs de staging
- [ ] Deploy a producción
- [ ] Monitoreo
- [ ] Backup de datos

---

## 📊 COMPARACIÓN: Local vs Producción

| Aspecto | Desarrollo (Ahora) | Producción (Futuro) |
|---------|-------------------|---------------------|
| **Frontend** | Vite Dev Server (localhost:5173) | Vercel CDN (https://...) |
| **Backend** | Express Local (localhost:3000) | Vercel Serverless |
| **Base de Datos** | PostgreSQL 17 Local | Supabase PostgreSQL |
| **Autenticación** | JWT Local | Supabase Auth (opcional) o JWT |
| **Storage** | N/A | Supabase Storage |
| **SSL** | No | Sí (automático) |
| **Escalabilidad** | Manual | Automática |
| **Backup** | Manual | Automático |

---

## 💰 COSTOS ESTIMADOS (Producción)

### Supabase (Free Tier)
- ✅ 500MB de base de datos
- ✅ 1GB de storage
- ✅ 50,000 usuarios activos mensuales
- ✅ GRATIS hasta estos límites

### Vercel (Free Tier)
- ✅ 100GB bandwidth
- ✅ Deployments ilimitados
- ✅ HTTPS automático
- ✅ GRATIS para proyectos personales

**Total: $0/mes** hasta que crezcas significativamente

---

## 🔐 SEGURIDAD EN PRODUCCIÓN

### Variables de Entorno Seguras

```bash
# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Usar en Vercel Environment Variables
```

### Rate Limiting

Agregar al backend:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});

app.use('/api/auth', limiter);
```

### CORS en Producción

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://tu-app.vercel.app'
    : 'http://localhost:5173'
};

app.use(cors(corsOptions));
```

---

## 📝 CHECKLIST PRE-DEPLOY

### Código
- [ ] No hay console.log innecesarios
- [ ] No hay TODOs en el código
- [ ] No hay credenciales hardcodeadas
- [ ] TypeScript compila sin errores
- [ ] ESLint sin errores

### Configuración
- [ ] Variables de entorno en Vercel configuradas
- [ ] Supabase configurado y probado
- [ ] vercel.json actualizado
- [ ] .gitignore incluye .env

### Testing
- [ ] Todas las funcionalidades probadas localmente
- [ ] No hay bugs críticos
- [ ] Performance aceptable

### Documentación
- [ ] README.md actualizado
- [ ] Variables de entorno documentadas
- [ ] Proceso de deploy documentado

---

## 🎯 COMANDOS DE DEPLOY

### Build Local (Probar antes de deploy)

```bash
# Build del frontend
npm run build

# Preview del build
npm run preview
# Abre http://localhost:4173
```

### Deploy a Vercel

```bash
# Primera vez
vercel

# Producción
vercel --prod
```

---

## 🔄 ROLLBACK (Si algo sale mal)

En Vercel:
1. Deployments → Click en deployment anterior
2. Click en "..." → Promote to Production

En Supabase:
1. Database → Backups
2. Restore from backup

---

## 📈 MONITOREO POST-DEPLOY

### Vercel
- Analytics → Ver tráfico
- Logs → Ver errores en tiempo real
- Speed Insights → Performance

### Supabase
- Dashboard → Database stats
- API Logs → Ver queries
- Storage → Uso de archivos

---

## 🚀 ESTRATEGIA DE MIGRACIÓN GRADUAL

### Opción 1: Big Bang (Todo de una vez)
1. Configura todo
2. Deploy completo
3. Cambia DNS/URL

**Ventaja**: Simple
**Desventaja**: Riesgoso

### Opción 2: Gradual (Recomendado)
1. **Fase 1**: Deploy frontend en Vercel, backend sigue local
2. **Fase 2**: Migrar BD a Supabase, backend sigue local
3. **Fase 3**: Deploy backend en Vercel
4. **Fase 4**: Migrar storage a Supabase

**Ventaja**: Menos riesgoso
**Desventaja**: Más tiempo

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Ahora**: Prueba TODO en desarrollo (usa `TESTING_CHECKLIST.md`)
2. **Esta semana**: Corrige bugs encontrados
3. **Próxima semana**: Crea cuenta Supabase y migra schema
4. **Siguiente**: Deploy en Vercel (staging)
5. **Final**: Producción completa

---

## 📚 RECURSOS

- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Supabase](https://supabase.com/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**Archivo creado**: `MIGRACION_PRODUCCION.md`

**Siguiente**: Voy a crear optimizaciones y mejoras para el código actual.

