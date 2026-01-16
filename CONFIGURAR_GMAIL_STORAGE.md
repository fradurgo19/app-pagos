# Configurar Gmail para Envío de Correos

## ✅ Tus Credenciales

- **Email:** storageentrenapartequipos@gmail.com
- **Contraseña:** Partequipos2024

## 🔧 Pasos para Configurar

### Paso 1: Verificar Autenticación en 2 Pasos

Ve a: https://myaccount.google.com/security

¿Tienes **Autenticación en 2 pasos** activada?

#### ✅ Si SÍ tienes activada:

1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona "Correo"
3. Selecciona "Otro (nombre personalizado)"
4. Escribe: "App Facturas Vercel"
5. Click en "Generar"
6. **Copia la contraseña de 16 caracteres** (ejemplo: `abcd efgh ijkl mnop`)

#### ❌ Si NO tienes activada:

1. Ve a: https://myaccount.google.com/lesssecureapps
2. **Activa** "Permitir aplicaciones menos seguras"
3. Usa tu contraseña normal: `Partequipos2024`

---

### Paso 2: Configurar en Vercel

1. Ve a: https://vercel.com/dashboard
2. Entra a tu proyecto "app-pagos"
3. Click en **Settings** → **Environment Variables**
4. Actualiza estas variables:

**Si usaste contraseña de aplicación:**
```
EMAIL_USER=storageentrenapartequipos@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_TO=fherrera@partequipos.com
```

**Si NO tienes 2FA y habilitaste aplicaciones menos seguras:**
```
EMAIL_USER=storageentrenapartequipos@gmail.com
EMAIL_PASSWORD=Partequipos2024
EMAIL_TO=fherrera@partequipos.com
```

5. Marca que apliquen a **Production**
6. Click en **Save**

---

### Paso 3: Redeploy

1. Ve a **Deployments**
2. Click en **⋯** (tres puntos) del último deployment
3. Click en **Redeploy**

---

### Paso 4: Probar

1. Crea una factura en: https://app-pagos-rho.vercel.app/new-bill
2. Revisa los logs en Vercel
3. Deberías ver: `✅ Correo enviado exitosamente`

---

## 🆘 Solución de Problemas

### Error: "Invalid login"

**Si tienes 2FA:** Usa contraseña de aplicación de 16 caracteres

**Si NO tienes 2FA:** 
1. Activa "Permitir aplicaciones menos seguras"
2. Usa tu contraseña normal

### Error: "Less secure app"

**Solución:** Ve a https://myaccount.google.com/lesssecureapps y actívalo

---

## 📝 Resumen Rápido

1. ✅ Ve a: https://myaccount.google.com/apppasswords
2. ✅ Genera contraseña de aplicación
3. ✅ Copia los 16 caracteres
4. ✅ Configura en Vercel como `EMAIL_PASSWORD`
5. ✅ Redeploy
6. ✅ Prueba creando una factura

