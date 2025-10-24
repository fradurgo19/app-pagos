# 📧 Configurar Gmail para Envío de Correos en Producción

## ✅ Ventajas de Gmail sobre Outlook

- ✅ Gratis
- ✅ Funciona perfectamente en Vercel serverless
- ✅ No tiene problemas de timeout
- ✅ Fácil de configurar

## 🔧 Pasos para Configurar

### Paso 1: Crear Cuenta Gmail (si no tienes)

1. Ve a: https://accounts.google.com/signup
2. Crea una cuenta Gmail nueva (ejemplo: `notificaciones.partequipos@gmail.com`)
3. Confirma el correo

### Paso 2: Habilitar Contraseña de Aplicación

**OPCIÓN A: Si tienes Autenticación en 2 Pasos activada**

1. Ve a: https://myaccount.google.com/apppasswords
2. Inicia sesión con tu cuenta Gmail
3. Selecciona "Correo" como app
4. Selecciona "Otro (nombre personalizado)" como dispositivo
5. Escribe: "App Facturas"
6. Click en "Generar"
7. Copia la contraseña de 16 caracteres (sin espacios)

**OPCIÓN B: Si NO tienes Autenticación en 2 Pasos**

1. Ve a: https://myaccount.google.com/lesssecureapps
2. Activa "Permitir aplicaciones menos seguras"
3. Usa tu contraseña normal de Gmail

### Paso 3: Configurar Variables en Vercel

1. Ve a: https://vercel.com/dashboard
2. Entra a tu proyecto "app-pagos"
3. **Settings** → **Environment Variables**
4. **Borra las variables actuales de Outlook** (si existen)
5. Agrega estas variables nuevas:

```
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicación-de-16-caracteres
EMAIL_TO=fherrera@partequipos.com
```

6. Marca que apliquen a **Production**
7. Click en **Save**

### Paso 4: Redeploy

1. Ve a **Deployments**
2. Click en **⋯** (tres puntos) del último deployment
3. Click en **Redeploy**

## ✅ Verificar que Funciona

1. Crea una factura de prueba en: https://app-pagos-rho.vercel.app/new-bill
2. Revisa los logs en Vercel
3. Deberías ver: `✅ Correo enviado exitosamente`
4. Revisa el correo en `fherrera@partequipos.com`

## 🆘 Solución de Problemas

### Error: "Invalid login"

**Solución:** Usa una contraseña de aplicación, no tu contraseña normal

### Error: "Less secure app access"

**Solución:** Activa "Permitir aplicaciones menos seguras" en Google

### Los correos no llegan

**Verifica:**
1. Revisa la carpeta de spam
2. Verifica que el correo de Gmail esté activo
3. Revisa los logs en Vercel

## 📝 Ejemplo de Variables

```env
EMAIL_USER=notificaciones.partequipos@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_TO=fherrera@partequipos.com
```

---

**IMPORTANTE:** Guarda la contraseña de aplicación en un lugar seguro. No la compartas públicamente.

