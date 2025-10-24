# Configurar Correos en Producción (Vercel)

## Variables de Entorno Requeridas en Vercel

Ve a tu proyecto en Vercel: https://vercel.com/dashboard

### Pasos:

1. **Settings** → **Environment Variables**
2. Agrega estas variables:

```
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=tu-contraseña-outlook
EMAIL_TO=fherrera@partequipos.com
```

3. Marca que apliquen a **Production**
4. Click en **Save**
5. **Re-despliega** la aplicación (Dashboard → Deployments → ⋯ → Redeploy)

## ⚠️ Importante: Contraseña de Outlook

Si tu cuenta tiene autenticación en 2 pasos:

1. Ve a: https://account.microsoft.com/security
2. Click en "Contraseñas de aplicación"
3. Genera una nueva contraseña para "Correo"
4. Usa esa contraseña (16 caracteres) en `EMAIL_PASSWORD`

## Verificar que Funciona

1. Crea una factura en https://app-pagos-rho.vercel.app/new-bill
2. Revisa los logs en Vercel: Dashboard → Deployment → Functions → Logs
3. Busca líneas que empiecen con "📧"

## Logs Esperados

```
📧 Iniciando envío de correo...
📧 EMAIL_USER configurado: Sí
📧 EMAIL_PASSWORD configurado: Sí
📧 Intentando enviar correo...
✅ Correo enviado exitosamente
```

## Si No Funciona

1. Verifica que las variables estén en producción
2. Verifica que el correo de Outlook sea correcto
3. Verifica que la contraseña sea correcta (sin espacios)
4. Revisa los logs en Vercel para ver el error específico

