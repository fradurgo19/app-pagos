# 🔧 Solución al Error de Gmail

## ❌ Error Actual

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

Este error significa que **Gmail está bloqueando el acceso** de tu aplicación por razones de seguridad.

---

## ✅ **Solución Paso a Paso**

### **Opción 1: Contraseña de Aplicación de Gmail** ⭐ **Recomendado**

#### **Paso 1: Habilitar Verificación en 2 Pasos**

1. Abre tu navegador y ve a:
   ```
   https://myaccount.google.com/signinoptions/two-step-verification
   ```

2. Inicia sesión con:
   - **Email:** analista.mantenimiento@partequipos.com
   - **Contraseña:** Fradurgo19.$

3. Click en **"Empezar"** o **"Activar"**

4. Sigue los pasos (te pedirá un número de teléfono)

5. **Completa la configuración**

#### **Paso 2: Generar Contraseña de Aplicación**

1. Una vez que la verificación en 2 pasos esté activa, ve a:
   ```
   https://myaccount.google.com/apppasswords
   ```

2. En "Selecciona la app" → Elige **"Correo"**

3. En "Selecciona el dispositivo" → Elige **"Otro (nombre personalizado)"**
   - Escribe: "Sistema Facturas"

4. Click en **"Generar"**

5. Te mostrará una contraseña de 16 dígitos como:
   ```
   abcd efgh ijkl mnop
   ```
   
6. **COPIA esta contraseña** (sin los espacios también funciona: abcdefghijklmnop)

#### **Paso 3: Actualizar backend/.env**

1. Abre el archivo:
   ```powershell
   notepad backend\.env
   ```

2. Busca la línea:
   ```env
   EMAIL_PASSWORD=Fradurgo19.$
   ```

3. Reemplázala con la contraseña de aplicación:
   ```env
   EMAIL_PASSWORD=abcdefghijklmnop
   ```
   (Usa la que Gmail te dio)

4. **Guarda el archivo** (Ctrl+S)

#### **Paso 4: Reiniciar el Servidor**

```powershell
# Detén el servidor (Ctrl+C)
# Luego reinicia:
npm run dev:all
```

#### **Paso 5: Verificar**

Deberías ver:
```
✅ Servidor de correo configurado correctamente
📧 Correos se enviarán desde: analista.mantenimiento@partequipos.com
📬 Correos llegarán a: fherrera@partequipos.com
```

---

### **Opción 2: Habilitar "Acceso de apps menos seguras"** (Menos Seguro)

Si no puedes usar contraseña de aplicación:

1. Ve a:
   ```
   https://myaccount.google.com/lesssecureapps
   ```

2. Inicia sesión con analista.mantenimiento@partequipos.com

3. **Activa** el interruptor

4. Mantén la contraseña actual en `backend/.env`:
   ```env
   EMAIL_PASSWORD=Fradurgo19.$
   ```

5. Reinicia el servidor

---

### **Opción 3: Usar Outlook en lugar de Gmail** (Alternativa)

Si Gmail no funciona, puedes usar Outlook:

#### **Paso 1: Cambiar Configuración**

Edita `backend/emailService.js`, busca esta parte:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // ← Cambiar
  port: 587,
  ...
```

Y cámbiala a:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',  // ← Outlook
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

#### **Paso 2: Actualizar .env**

```env
EMAIL_USER=tu-correo@outlook.com
EMAIL_PASSWORD=tu-contraseña-outlook
EMAIL_TO=fherrera@partequipos.com
```

---

## 🧪 **Probar el Correo**

Una vez configurado correctamente:

1. **Crea una factura:**
   - http://localhost:5173/new-bill
   - Completa el formulario
   - Click "Enviar Factura"

2. **Verifica logs del backend:**
   ```
   ✅ Factura creada en BD
   📧 Correo enviado a fherrera@partequipos.com y usuario@ejemplo.com
   ```

3. **Revisa tu correo:**
   - Bandeja de entrada de fherrera@partequipos.com
   - Si no llega, revisa SPAM

---

## 🆘 **Si Sigue Fallando**

### **El sistema puede funcionar SIN correos:**

El error de correo **NO impedirá** que el sistema funcione. Solo significa que:
- ✅ Las facturas se crearán normalmente
- ❌ Los correos NO se enviarán

Puedes seguir usando el sistema y configurar el correo después.

---

## 📞 **Ayuda Adicional**

### **Ver logs detallados:**

Cuando crees una factura, revisa la terminal del backend. Verás:
- ✅ Si el correo se envió
- ❌ Si falló (con el motivo)

### **Desactivar temporalmente el correo:**

Si quieres que el sistema NO intente enviar correos, comenta estas líneas en `backend/server.js`:

```javascript
// Enviar correo de forma asíncrona (no bloquea la respuesta)
/* COMENTADO TEMPORALMENTE
sendNewBillNotification(transformedBill, userEmail, userName, attachmentPath)
  .then(result => { ... })
  .catch(error => { ... });
*/
```

---

## ✅ **Resumen de la Solución Recomendada**

1. ✅ Ve a: https://myaccount.google.com/apppasswords
2. ✅ Genera una contraseña de aplicación
3. ✅ Actualiza `EMAIL_PASSWORD` en `backend/.env`
4. ✅ Reinicia el servidor
5. ✅ ¡Listo!

---

**Necesitas ayuda con algún paso específico?** 😊

