# 📧 Configurar Resend para Envío de Correos

## ✅ Ventajas de Resend

- ✅ **100% GRATIS** hasta 3,000 correos/mes
- ✅ Sin necesidad de autenticación en 2 pasos
- ✅ Funciona perfectamente en Vercel
- ✅ API simple y rápida

## 🔧 Pasos para Configurar

### Paso 1: Crear Cuenta en Resend

1. Ve a: https://resend.com
2. Click en **Sign Up** (arriba a la derecha)
3. Crea cuenta con tu email: `storageentrenapartequipos@gmail.com`
4. Confirma tu correo

### Paso 2: Verificar Tu Dominio

1. Entra a tu dashboard en Resend
2. Click en **Domains** (menú lateral)
3. Click en **Add Domain**
4. Agrega: `partequipos.com` (si tienes dominio)
5. O usa el dominio por defecto de Resend (funciona igual)

### Paso 3: Generar API Key

1. En el dashboard, click en **API Keys**
2. Click en **Create API Key**
3. Dale un nombre: "App Facturas"
4. Click en **Create**
5. **COPIA la API Key** (solo se muestra una vez)

### Paso 4: Configurar en Vercel

1. Ve a: https://vercel.com/dashboard
2. Entra a tu proyecto "app-pagos"
3. **Settings** → **Environment Variables**
4. Agrega estas variables:

```
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=storageentrenapartequipos@gmail.com
EMAIL_TO=fherrera@partequipos.com
```

5. Marca que apliquen a **Production**
6. Click en **Save**

### Paso 5: Redeploy

1. Ve a **Deployments**
2. Click en **⋯** (tres puntos) del último deployment
3. Click en **Redeploy**

### Paso 6: Probar

1. Crea una factura en: https://app-pagos-rho.vercel.app/new-bill
2. Revisa los logs en Vercel
3. Deberías ver: `✅ Correo enviado exitosamente`
4. Revisa el correo en `fherrera@partequipos.com`

## 📝 Ejemplo de API Key

```
RESEND_API_KEY=re_abc123def456ghi789jkl
```

## 🆘 Solución de Problemas

### Los correos no llegan

**Verifica:**
1. Revisa la carpeta de spam
2. Verifica que la API Key sea correcta
3. Revisa los logs en Vercel

### Error de autenticación

**Solución:** Verifica que la API Key esté correcta y empiece con `re_`

---

**Listo en 5 minutos** ⚡

