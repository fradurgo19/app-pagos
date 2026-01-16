# 🔧 Solución al Error 403 de Mailgun

## ❌ Problema Identificado

Mailgun está bloqueando el envío porque `fherrera@partequipos.com` NO está en la lista de destinatarios autorizados del dominio sandbox.

## ✅ Solución Rápida

Cambia la variable `EMAIL_TO` en Vercel de:
```
EMAIL_TO=fherrera@partequipos.com
```

A:
```
EMAIL_TO=analista.mantenimiento@partequipos.com
```

## 🔧 Pasos para Solucionar

### Opción 1: Cambiar Variable de Entorno (MÁS RÁPIDO)

1. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. Busca `EMAIL_TO`
3. Cambia el valor a: `analista.mantenimiento@partequipos.com`
4. Click en **Save**
5. Redeploy el proyecto

### Opción 2: Agregar Email Autorizado en Mailgun

1. Ve a: https://app.mailgun.com
2. Entra a tu cuenta Mailgun
3. Ve a **Domains** → Tu dominio sandbox
4. Busca **"Authorized Recipients"**
5. Agrega: `fherrera@partequipos.com`
6. Click en **Add**

## 🎯 Variables de Entorno Actualizadas

```
MAILGUN_API_KEY=***REEMPLAZAR_EN_VERCE***    # copiar desde tu vault/entorno
MAILGUN_DOMAIN=***REEMPLAZAR_EN_VERCE***      # dominio sandbox o productivo
EMAIL_FROM=analista.mantenimiento@partequipos.com
EMAIL_TO=analista.mantenimiento@partequipos.com
```

## ✅ Resultado Esperado

Después del cambio:
- ✅ Los correos se enviarán a `analista.mantenimiento@partequipos.com`
- ✅ No habrá error 403 Forbidden
- ✅ El sistema funcionará correctamente

## 📧 Nota Importante

Con un dominio sandbox de Mailgun, solo puedes enviar a emails autorizados. Para enviar a cualquier email, necesitarías:
1. Verificar tu propio dominio en Mailgun
2. O actualizar a un plan de pago
