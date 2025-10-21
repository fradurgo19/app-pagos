# 📧 INSTRUCCIONES RÁPIDAS - Configuración de Correo

## ⚡ Pasos Rápidos (5 minutos)

### 1️⃣ Crear archivo .env

Copia el archivo de ejemplo y renómbralo:

```powershell
# En PowerShell, desde la raíz del proyecto:
Copy-Item env.example.local .env
```

O manualmente:
1. Copia `env.example.local`
2. Renombra la copia a `.env`

---

### 2️⃣ Editar .env con tus credenciales

Abre `.env` y verifica que tenga:

```env
# Configuración de Correo Electrónico
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=Fradurgo19.$
EMAIL_TO=fherrera@partequipos.com
```

**⚠️ IMPORTANTE:** Si Gmail bloquea el inicio de sesión, necesitas generar una **Contraseña de Aplicación** (ver instrucciones abajo).

---

### 3️⃣ Reiniciar el Servidor

```powershell
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev:all
```

Deberías ver:
```
✅ Servidor de correo configurado correctamente
```

---

### 4️⃣ Probar Creando una Factura

1. Ve a: http://localhost:5173/new-bill
2. Completa el formulario
3. Sube un archivo (opcional)
4. Click en "Enviar Factura"

**Resultado esperado:**
- ✅ Factura creada
- ✅ Correo enviado a fherrera@partequipos.com
- ✅ Copia al usuario que creó la factura
- ✅ Archivo adjunto incluido (si se subió)

---

## 🔐 Si Gmail Bloquea el Acceso

### Opción A: Contraseña de Aplicación (Más Seguro)

1. Ve a: https://myaccount.google.com/apppasswords
2. Inicia sesión con analista.mantenimiento@partequipos.com
3. Selecciona "Correo" y "Windows Computer"
4. Copia la contraseña de 16 dígitos (ej: "abcd efgh ijkl mnop")
5. Actualiza `.env`:
   ```env
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```
6. Reinicia el servidor

### Opción B: Habilitar "Acceso de apps menos seguras"

1. Ve a: https://myaccount.google.com/lesssecureapps
2. Activa el interruptor
3. Mantén la contraseña actual en `.env`

---

## ✅ Verificación

### En el Backend (Terminal):

Cuando inicies el servidor:
```
✅ Servidor de correo configurado correctamente
```

Cuando se cree una factura:
```
📧 Correo enviado a fherrera@partequipos.com y usuario@ejemplo.com
```

### En el Correo:

Revisa:
1. Bandeja de entrada de fherrera@partequipos.com
2. Bandeja de entrada del usuario que creó la factura
3. Si no llega, revisa SPAM/Correo no deseado

---

## 📧 Formato del Correo

**Para:** fherrera@partequipos.com  
**CC:** correo-del-usuario@ejemplo.com  
**De:** analista.mantenimiento@partequipos.com  
**Asunto:** Nueva Factura Registrada - FAC-001 - Electricidad  
**Adjunto:** factura.pdf (si existe)

---

## 🆘 Ayuda Rápida

### El correo no se envía:

```powershell
# 1. Verifica las variables
notepad .env

# 2. Reinicia el servidor
# Detén con Ctrl+C y luego:
npm run dev:backend
```

### Ver logs detallados:

Revisa la terminal del backend, verás:
- ✅ si el correo se envió
- ❌ si hubo error (con descripción)

---

**¡Listo!** 🎉

Una vez configurado, cada factura nueva enviará automáticamente un correo con todos los detalles.

