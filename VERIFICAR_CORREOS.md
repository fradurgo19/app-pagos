# Verificación de Correos

## Variables de Entorno Necesarias en Vercel

Verifica que estas variables estén configuradas en tu proyecto de Vercel:

```
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=Fradurgo19.$
EMAIL_TO=fherrera@partequipos.com
VITE_SUPABASE_URL=https://rafmynmmenebreqeagvm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=tu-service-key-aqui
```

**Para agregar o modificar variables en Vercel:**
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las variables que falten

## Logs que deberías ver

Cuando creas una factura, deberías ver estos logs en Vercel:

```
📧 Intentando obtener datos del usuario para correo...
📧 User ID: 802c4592-b80b-4fad-986c-a601c1035d73
📧 Resultado de consulta Supabase:
📧 Data: { email: "...", full_name: "..." }
📧 Error: null
✅ Datos del usuario obtenidos: ... - ...
✅ Correo enviado a fherrera@partequipos.com y ...
```

## Si NO ves esos logs

Significa que el código nuevo NO está desplegado. Necesitas:

```bash
git add backend/server.js backend/supabaseClient.js
git commit -m "fix: Improve email notification logging"
git push origin main
```

Espera a que Vercel termine de desplegar y prueba de nuevo.

