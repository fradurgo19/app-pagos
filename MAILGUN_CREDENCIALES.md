# 📧 Configuración Mailgun - Credenciales Obtenidas

## ✅ Credenciales de Mailgun

**Dominio Sandbox:**
```
sandbox082e1b1f16f24f3cb4809e3a6f80b899.mailgun.org
```

**API Key:**
```
[CONFIGURAR EN VERCEL - Ver variables de entorno abajo]
```

**Base URL:**
```
https://api.mailgun.net
```

**Email Autorizado:**
```
analista.mantenimiento@partequipos.com
```

## 🔧 Variables de Entorno para Vercel

Configura estas variables en tu proyecto de Vercel:

```
MAILGUN_API_KEY=[TU_API_KEY_AQUI]
MAILGUN_DOMAIN=sandbox082e1b1f16f24f3cb4809e3a6f80b899.mailgun.org
EMAIL_FROM=analista.mantenimiento@partequipos.com
EMAIL_TO=fherrera@partequipos.com
```

## ⚠️ Importante - Dominio Sandbox

Como estás usando un **dominio sandbox**, solo puedes enviar correos a:
- `analista.mantenimiento@partequipos.com` (email autorizado)
- Cualquier email que agregues en la sección "Authorized recipients"

**✅ SOLUCIONADO:** El código ha sido modificado para que:
- Solo envíe correos a `analista.mantenimiento@partequipos.com`
- NO incluya CC al usuario que crea la factura (para evitar errores)
- Incluya una nota en el correo explicando por qué solo se envía a analista

## 🚀 Pasos para Activar

1. **Ve a Vercel Dashboard** → Tu proyecto → Settings → Environment Variables
2. **Agrega las 4 variables** de arriba
3. **Marca "Production"** para que apliquen en producción
4. **Redeploy** el proyecto
5. **Prueba** creando una factura

## 🎯 Logs Esperados

```
📧 Iniciando envío de correo con API Mailgun...
📧 Destinatario: analista.mantenimiento@partequipos.com
📧 Usuario que creó la factura: usuario@ejemplo.com (NO se envía CC por restricciones sandbox)
📧 MAILGUN_API_KEY configurado: Sí
📧 MAILGUN_DOMAIN configurado: Sí
✅ Correo enviado exitosamente en 234ms
✅ Message ID: <20250115-123456-789abc@sandbox082e1b1f16f24f3cb4809e3a6f80b899.mailgun.org>
✅ Enviado solo a analista.mantenimiento@partequipos.com (dominio sandbox)
```

## 🔍 Para Verificar

Después del redeploy, crea una factura de prueba y revisa los logs en Vercel para confirmar que el correo se envía correctamente.
