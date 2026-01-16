# Seguridad y Autenticación - APPpagos

## Sistema de Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación de usuarios. Este método es seguro, escalable y no requiere mantener sesiones en el servidor.

## Flujo de Autenticación

### 1. Registro de Usuario

```
Usuario completa formulario
    ↓
Frontend envía datos a POST /api/auth/register
    ↓
Backend valida datos y encripta contraseña con bcrypt
    ↓
Backend crea usuario en PostgreSQL
    ↓
Backend genera token JWT
    ↓
Frontend guarda token en localStorage
    ↓
Usuario queda autenticado
```

### 2. Inicio de Sesión

```
Usuario ingresa email y contraseña
    ↓
Frontend envía a POST /api/auth/login
    ↓
Backend busca usuario en base de datos
    ↓
Backend verifica contraseña con bcrypt
    ↓
Si es correcta, genera token JWT
    ↓
Frontend guarda token en localStorage
    ↓
Usuario queda autenticado
```

### 3. Peticiones Autenticadas

```
Frontend hace petición a API
    ↓
Agrega header: Authorization: Bearer <token>
    ↓
Backend verifica token JWT
    ↓
Si válido → procesa petición
Si inválido → retorna 401 Unauthorized
```

## JWT (JSON Web Tokens)

### Estructura del Token

Un JWT tiene tres partes separadas por puntos:

```
header.payload.signature
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "id": "uuid-del-usuario",
  "email": "usuario@ejemplo.com",
  "role": "basic_user",
  "iat": 1234567890,
  "exp": 1235172690
}
```

**Signature:**
Firma criptográfica usando el `JWT_SECRET` para verificar que el token no ha sido modificado.

### Configuración del Token

- **Algoritmo**: HS256 (HMAC con SHA-256)
- **Validez**: 7 días desde la emisión
- **Secret**: Se almacena en variable de entorno `JWT_SECRET`
- **Almacenamiento**: localStorage en el navegador

### Seguridad del Token

✅ **Ventajas:**
- No requiere almacenamiento en servidor (stateless)
- Incluye información del usuario (evita consultas adicionales)
- Firma criptográfica previene modificaciones
- Expiración automática

⚠️ **Consideraciones:**
- El token se almacena en localStorage (vulnerable a XSS)
- Si se compromete, es válido hasta su expiración
- No se puede revocar antes de expiración (sin blacklist)

## Encriptación de Contraseñas

### Bcrypt

Las contraseñas se encriptan usando **bcrypt**, un algoritmo de hashing diseñado específicamente para contraseñas.

**Características:**
- **Salt automático**: Cada contraseña tiene un salt único
- **Cost factor**: 10 rounds (ajustable según necesidades de seguridad)
- **Irreversible**: No se puede obtener la contraseña original del hash

**Ejemplo:**
```
Contraseña original: "miPassword123"
Hash generado: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

### Verificación de Contraseñas

Cuando un usuario inicia sesión:
1. Se obtiene el hash almacenado en la base de datos
2. Se compara con la contraseña ingresada usando bcrypt
3. Si coinciden, se genera el token JWT

## Control de Acceso Basado en Roles (RBAC)

El sistema tiene dos roles principales:

### 1. Usuario Básico (`basic_user`)

**Permisos:**
- ✅ Crear sus propias facturas
- ✅ Ver sus propias facturas
- ✅ Editar sus propias facturas (solo borradores y pendientes)
- ✅ Eliminar sus propias facturas (solo borradores)
- ✅ Ver su propio perfil
- ✅ Ver sus propias notificaciones
- ❌ No puede aprobar facturas
- ❌ No puede ver facturas de otros usuarios
- ❌ No puede gestionar usuarios

### 2. Coordinador de Área (`area_coordinator`)

**Permisos:**
- ✅ Todos los permisos de usuario básico
- ✅ Ver todas las facturas de su ubicación
- ✅ Aprobar facturas pendientes
- ✅ Ver usuarios de su ubicación
- ✅ Gestionar presupuestos de su ubicación
- ❌ No puede ver facturas de otras ubicaciones
- ❌ No puede gestionar usuarios de otras ubicaciones

### Implementación de Permisos

**En el Backend:**
```javascript
// Middleware para verificar rol
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sin permisos' });
    }
    next();
  };
};

// Uso en rutas
app.post('/api/bills/:id/approve', 
  authenticateToken, 
  requireRole(['area_coordinator']),
  approveBill
);
```

**En el Frontend:**
```typescript
// Componente protegido por rol
<RoleProtectedRoute allowedRoles={['area_coordinator']}>
  <DashboardPage />
</RoleProtectedRoute>
```

## Row Level Security (RLS)

La base de datos implementa seguridad a nivel de fila para proteger los datos incluso si hay un bypass en la aplicación.

### Políticas RLS para `utility_bills`

**Usuarios básicos:**
```sql
-- Pueden ver solo sus propias facturas
CREATE POLICY "users_view_own_bills"
ON utility_bills FOR SELECT
USING (user_id = auth.uid());
```

**Coordinadores:**
```sql
-- Pueden ver facturas de su ubicación
CREATE POLICY "coordinators_view_location_bills"
ON utility_bills FOR SELECT
USING (
  user_id = auth.uid() 
  OR (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'area_coordinator'
    AND location = (SELECT location FROM profiles WHERE id = auth.uid())
  )
);
```

## Validación de Datos

### Frontend
- Validación en tiempo real en formularios
- Tipos de datos correctos (TypeScript)
- Sanitización de inputs

### Backend
- Validación de todos los parámetros
- Verificación de tipos de datos
- Límites de tamaño de archivos (10MB máximo)
- Tipos de archivo permitidos (PDF, JPG, PNG)

**Ejemplo:**
```javascript
// Validación de factura
if (!serviceType || !totalAmount || !period) {
  return res.status(400).json({ error: 'Campos requeridos faltantes' });
}

if (totalAmount < 0) {
  return res.status(400).json({ error: 'Monto no puede ser negativo' });
}
```

## Protección contra Ataques Comunes

### 1. SQL Injection
✅ **Protección:**
- Uso de consultas parametrizadas
- No concatenación de strings en SQL
- Uso de ORM/Supabase client que escapa automáticamente

### 2. XSS (Cross-Site Scripting)
✅ **Protección:**
- React escapa automáticamente el contenido
- Validación de inputs
- No uso de `dangerouslySetInnerHTML`

### 3. CSRF (Cross-Site Request Forgery)
✅ **Protección:**
- Tokens JWT en headers (no en cookies)
- CORS configurado correctamente
- Verificación de origen en producción

### 4. Ataques de Fuerza Bruta
⚠️ **Recomendación:**
- Implementar rate limiting en endpoints de autenticación
- Bloquear IPs después de múltiples intentos fallidos
- Considerar CAPTCHA después de 3 intentos

### 5. Exposición de Información
✅ **Protección:**
- No se exponen mensajes de error detallados en producción
- No se revelan si un email existe o no en el sistema
- Logs no contienen información sensible

## Variables de Entorno Sensibles

**Nunca** deben estar en el código:
- `JWT_SECRET`: Secreto para firmar tokens
- `DATABASE_URL`: Credenciales de base de datos
- `SUPABASE_SERVICE_ROLE_KEY`: Key con permisos completos
- `SENDGRID_API_KEY` / `MAILGUN_API_KEY`: Keys de servicios de email

**Recomendaciones:**
- Usar archivo `.env` (no versionado en Git)
- Usar `.env.example` como plantilla
- En producción, usar variables de entorno del servidor
- Rotar secrets periódicamente

## HTTPS y SSL

### Desarrollo
- HTTP es aceptable para desarrollo local
- CORS habilitado para `localhost`

### Producción
✅ **Requerido:**
- HTTPS obligatorio
- Certificado SSL válido
- Redirección de HTTP a HTTPS
- Headers de seguridad (HSTS, CSP)

## Mejores Prácticas Implementadas

1. ✅ **Contraseñas fuertes**: Validación de complejidad (opcional, recomendado)
2. ✅ **Tokens con expiración**: 7 días de validez
3. ✅ **Encriptación de contraseñas**: Bcrypt con salt
4. ✅ **Validación de entrada**: En frontend y backend
5. ✅ **Control de acceso**: Basado en roles
6. ✅ **Seguridad a nivel de base de datos**: RLS policies
7. ✅ **Límites de archivos**: Tamaño y tipo validados

## Recomendaciones Adicionales

### Para Producción

1. **Rate Limiting:**
   - Implementar límites de peticiones por IP
   - Especialmente en endpoints de autenticación

2. **Logging y Monitoreo:**
   - Registrar intentos de acceso fallidos
   - Alertas por actividad sospechosa
   - Monitoreo de tokens expirados

3. **Backup de Seguridad:**
   - Backups regulares de la base de datos
   - Almacenamiento seguro de backups
   - Plan de recuperación ante desastres

4. **Auditoría:**
   - Registrar cambios importantes (aprobaciones, eliminaciones)
   - Mantener historial de acciones de usuarios

5. **Actualizaciones:**
   - Mantener dependencias actualizadas
   - Parches de seguridad aplicados rápidamente

## Próximos Pasos

- Consulta la [documentación de despliegue](07-Despliegue-Produccion.md) para configuración de seguridad en producción
- Revisa la [documentación de la API](05-API-Endpoints.md) para ver cómo se implementa la autenticación

