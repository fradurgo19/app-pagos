# 📧 Configuración de Correos con Gmail SMTP

## ✅ Cambios Implementados

- ✅ Migrado de Mailgun a Gmail SMTP
- ✅ Correo principal siempre va a `fherrera@partequipos.com`
- ✅ Copia (CC) se envía al usuario que crea la factura
- ✅ Se usa aplicación Gmail con contraseña de aplicación

## 🔧 Variables de Entorno para Vercel

### BORRAR estas variables (si existen):
```
MAILGUN_API_KEY
MAILGUN_DOMAIN
EMAIL_FROM
```

### AGREGAR estas variables nuevas:
```
GMAIL_USER=fradurgo19@gmail.com
GMAIL_APP_PASSWORD=lazh ellf jmlt gsfd
EMAIL_TO=fherrera@partequipos.com
```

## 📋 Cómo Configurar en Vercel

### Paso 1: Ir a Vercel Dashboard
1. Ve a: https://vercel.com/dashboard
2. Entra a tu proyecto "app-pagos"

### Paso 2: Eliminar Variables de Mailgun
1. **Settings** → **Environment Variables**
2. Busca y **borra** (si existen):
   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`
   - `EMAIL_FROM`
3. Click en **Save**

### Paso 3: Agregar Variables de Gmail
1. Click en **Add New**
2. Agrega estas 3 variables:
   
   **Variable 1:**
   - Name: `GMAIL_USER`
   - Value: `fradurgo19@gmail.com`
   - Marca **Production**
   
   **Variable 2:**
   - Name: `GMAIL_APP_PASSWORD`
   - Value: `lazh ellf jmlt gsfd`
   - Marca **Production**
   
   **Variable 3:**
   - Name: `EMAIL_TO`
   - Value: `fherrera@partequipos.com`
   - Marca **Production**

### Paso 4: Redeploy
1. Ve a **Deployments**
2. Click en **⋯** (tres puntos) del último deployment
3. Click en **Redeploy**

## 🎯 Resultado Esperado

Después del redeploy:
- ✅ Correo principal va a `fherrera@partequipos.com`
- ✅ Copia (CC) se envía al usuario que creó la factura
- ✅ Correo se envía desde `fradurgo19@gmail.com`

## 🧪 Probar

1. Crea una factura nueva
2. Verifica que:
   - `fherrera@partequipos.com` recibe el correo principal
   - El usuario creador recibe una copia (CC)

## 📝 Notas Importantes

- ✅ Gmail permitirá enviar a cualquier destinatario (no tiene restricciones de sandbox)
- ✅ La contraseña de aplicación es segura y se usa solo para enviar correos
- ✅ Los correos se envían en formato HTML con toda la información de la factura
