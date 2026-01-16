# Despliegue y Producción - APPpagos

## Consideraciones Previas al Despliegue

Antes de desplegar el sistema en producción, asegúrate de:

1. ✅ Todas las funcionalidades están probadas
2. ✅ Variables de entorno de producción configuradas
3. ✅ Base de datos de producción configurada
4. ✅ Certificado SSL obtenido
5. ✅ Dominio configurado
6. ✅ Backups configurados

## Arquitectura de Producción

```
┌─────────────────┐
│   CDN/Vercel    │  Frontend (React)
│   (Estático)    │  https://apppagos.com
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│   Servidor      │  Backend (Node.js)
│   Backend       │  https://api.apppagos.com
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│   Supabase      │  PostgreSQL + Storage
│   (Producción)  │  Base de datos
└─────────────────┘
```

## Despliegue del Frontend

### Opción 1: Vercel (Recomendado)

Vercel es ideal para aplicaciones React y ofrece despliegue automático.

**Pasos:**

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login en Vercel:**
   ```bash
   vercel login
   ```

3. **Configurar proyecto:**
   ```bash
   vercel
   ```
   - Sigue las instrucciones
   - Configura las variables de entorno

4. **Variables de entorno en Vercel:**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega:
     ```
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu_anon_key
     VITE_API_URL=https://api.apppagos.com
     ```

5. **Desplegar:**
   ```bash
   vercel --prod
   ```

**Ventajas:**
- ✅ Despliegue automático desde Git
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Escalado automático

### Opción 2: Servidor Propio

Si prefieres usar tu propio servidor:

1. **Construir la aplicación:**
   ```bash
   npm run build
   ```

2. **La carpeta `dist/` contiene los archivos estáticos**

3. **Configurar servidor web (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name apppagos.com;
       
       root /var/www/apppagos/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Configurar SSL con Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d apppagos.com
   ```

## Despliegue del Backend

### Opción 1: Servidor VPS/Cloud

**Requisitos del servidor:**
- Node.js 18+ instalado
- Al menos 1GB RAM
- Puerto 3000 (o el que configures) abierto

**Pasos:**

1. **Conectar al servidor:**
   ```bash
   ssh usuario@tu-servidor.com
   ```

2. **Clonar repositorio:**
   ```bash
   git clone <url-repositorio> apppagos
   cd apppagos/backend
   ```

3. **Instalar dependencias:**
   ```bash
   npm install --production
   ```

4. **Configurar variables de entorno:**
   ```bash
   nano .env
   ```
   
   Configura:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu-secret-muy-seguro-y-largo
   VITE_API_URL=https://api.apppagos.com
   # ... otras variables
   ```

5. **Usar PM2 para gestión del proceso:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name apppagos-backend
   pm2 save
   pm2 startup
   ```

6. **Configurar Nginx como reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name api.apppagos.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Configurar SSL:**
   ```bash
   sudo certbot --nginx -d api.apppagos.com
   ```

### Opción 2: Plataformas como Servicio

**Heroku, Railway, Render, etc.:**

1. Conecta tu repositorio Git
2. Configura las variables de entorno
3. Especifica el comando de inicio: `node server.js`
4. El servicio maneja el despliegue automáticamente

## Configuración de Base de Datos en Producción

### Supabase (Recomendado)

1. **Crear proyecto de producción en Supabase**

2. **Ejecutar migraciones:**
   - Ve a SQL Editor
   - Ejecuta todas las migraciones en orden:
     - `20251001212345_create_utility_bills_schema.sql`
     - `20250115000000_add_contract_number.sql`

3. **Configurar Storage:**
   - Crea bucket `invoices`
   - Configura políticas de acceso
   - Limita tamaño de archivos

4. **Configurar backups:**
   - Supabase ofrece backups automáticos
   - Configura frecuencia según necesidades

### PostgreSQL Propio

Si usas tu propio PostgreSQL:

1. **Crear base de datos:**
   ```sql
   CREATE DATABASE apppagos_prod;
   ```

2. **Ejecutar migraciones:**
   ```bash
   psql -U postgres -d apppagos_prod -f supabase/migrations/20251001212345_create_utility_bills_schema.sql
   ```

3. **Configurar backups:**
   ```bash
   # Script de backup diario
   #!/bin/bash
   pg_dump -U postgres apppagos_prod > /backups/apppagos_$(date +%Y%m%d).sql
   ```

## Variables de Entorno de Producción

### Frontend (.env.production)

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_produccion
VITE_API_URL=https://api.apppagos.com
```

### Backend (.env)

```env
# Entorno
NODE_ENV=production
PORT=3000

# Base de Datos
DATABASE_URL=postgresql://usuario:password@host:5432/apppagos_prod
# O Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# JWT
JWT_SECRET=genera-un-secret-muy-largo-y-aleatorio-aqui

# API
VITE_API_URL=https://api.apppagos.com

# Email (configura uno)
SENDGRID_API_KEY=tu_api_key
EMAIL_FROM=noreply@apppagos.com
EMAIL_FROM_NAME=APPpagos Sistema

# CORS (ajustar según tu dominio)
CORS_ORIGIN=https://apppagos.com
```

**⚠️ IMPORTANTE:**
- `JWT_SECRET` debe ser diferente en producción
- Genera un secret largo y aleatorio:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

## Configuración de Dominio

### DNS

Configura los siguientes registros:

```
A     @              → IP del servidor backend
A     api            → IP del servidor backend
CNAME www            → apppagos.com (si usas Vercel)
```

### SSL/TLS

- **Vercel**: SSL automático
- **Servidor propio**: Usa Let's Encrypt con Certbot
- **Cloudflare**: SSL automático si usas su CDN

## Monitoreo y Logging

### PM2 Monitoring

Si usas PM2:

```bash
# Ver logs
pm2 logs apppagos-backend

# Ver estado
pm2 status

# Reiniciar
pm2 restart apppagos-backend
```

### Logging en Producción

Configura logging estructurado:

```javascript
// En server.js
if (process.env.NODE_ENV === 'production') {
  // Usar servicio de logging (Winston, Pino, etc.)
  // O simplemente console.log (PM2 captura)
}
```

### Monitoreo Recomendado

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry, Rollbar
- **Performance**: New Relic, Datadog
- **Analytics**: Google Analytics (opcional)

## Backups

### Base de Datos

**Automático (Supabase):**
- Backups diarios automáticos
- Retención configurable

**Manual (PostgreSQL propio):**
```bash
# Script de backup diario
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres apppagos_prod > /backups/apppagos_$DATE.sql
# Eliminar backups mayores a 30 días
find /backups -name "apppagos_*.sql" -mtime +30 -delete
```

### Archivos (Supabase Storage)

- Supabase maneja backups automáticamente
- Considera backup manual periódico de documentos importantes

## Actualizaciones y Mantenimiento

### Proceso de Actualización

1. **Desarrollo:**
   ```bash
   git pull origin main
   npm install
   npm run build
   ```

2. **Backend:**
   ```bash
   cd backend
   git pull origin main
   npm install --production
   pm2 restart apppagos-backend
   ```

3. **Migraciones de BD:**
   ```bash
   psql -U postgres -d apppagos_prod -f supabase/migrations/nueva_migracion.sql
   ```

### Ventana de Mantenimiento

Si necesitas hacer mantenimiento:

1. Notifica a los usuarios
2. Coloca el sistema en modo mantenimiento (opcional)
3. Realiza las actualizaciones
4. Verifica que todo funcione
5. Notifica que el sistema está disponible

## Seguridad en Producción

### Checklist de Seguridad

- ✅ HTTPS habilitado en todos los dominios
- ✅ Variables de entorno no expuestas
- ✅ `JWT_SECRET` fuerte y único
- ✅ CORS configurado solo para dominios permitidos
- ✅ Rate limiting implementado
- ✅ Logs no contienen información sensible
- ✅ Backups configurados y probados
- ✅ Firewall configurado en servidor
- ✅ Actualizaciones de seguridad aplicadas

### Headers de Seguridad

Configura en Nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000" always;
```

## Escalabilidad

### Frontend
- Ya está en CDN (Vercel o similar)
- Escala automáticamente

### Backend
- **Horizontal**: Múltiples instancias con load balancer
- **Vertical**: Aumentar recursos del servidor
- **Caching**: Implementar Redis para sesiones (si es necesario)

### Base de Datos
- Supabase maneja escalado automático
- PostgreSQL propio: Considera read replicas para consultas pesadas

## Troubleshooting en Producción

### El backend no inicia
```bash
# Ver logs
pm2 logs apppagos-backend

# Verificar variables de entorno
pm2 env apppagos-backend

# Verificar puerto
netstat -tulpn | grep 3000
```

### Error de conexión a base de datos
- Verifica `DATABASE_URL`
- Verifica que PostgreSQL esté corriendo
- Verifica firewall/security groups

### Frontend no carga
- Verifica que `VITE_API_URL` sea correcto
- Verifica CORS en backend
- Revisa consola del navegador

### Archivos no se suben
- Verifica `SUPABASE_SERVICE_ROLE_KEY`
- Verifica permisos del bucket
- Verifica límites de tamaño

## Contacto y Soporte

Para problemas en producción:
1. Revisa logs del servidor
2. Revisa logs del navegador (consola)
3. Verifica estado de servicios externos (Supabase, email)
4. Consulta documentación técnica

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0

