# 📧 Configuración de Notificaciones por Correo Electrónico

## ⚠️ IMPORTANTE: Configuración de Gmail

Para que el envío de correos funcione correctamente con Gmail, necesitas configurar una **Contraseña de Aplicación** en lugar de usar tu contraseña normal.

### 🔐 Pasos para Configurar Gmail

#### Opción 1: Contraseña de Aplicación (Recomendado)

1. **Ve a tu cuenta de Google:**
   - https://myaccount.google.com/

2. **Habilita la verificación en 2 pasos:**
   - Ve a Seguridad → Verificación en 2 pasos
   - Sigue los pasos para habilitarla

3. **Crea una Contraseña de Aplicación:**
   - Ve a Seguridad → Contraseñas de aplicaciones
   - Selecciona "Correo" y "Otro dispositivo"
   - Copia la contraseña de 16 caracteres generada

4. **Actualiza tu archivo `.env`:**
   ```env
   EMAIL_USER=analista.mantenimiento@partequipos.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Contraseña de aplicación de 16 dígitos
   EMAIL_TO=fherrera@partequipos.com
   ```

#### Opción 2: Permitir Aplicaciones Menos Seguras (No Recomendado)

Si no puedes usar contraseña de aplicación:

1. Ve a: https://myaccount.google.com/lesssecureapps
2. Activa "Permitir aplicaciones menos seguras"
3. Usa tu contraseña normal en `.env`

---

## 📋 Variables de Entorno Requeridas

Copia `env.example.local` como `.env` en la raíz del proyecto y configura:

```env
# Configuración de Correo Electrónico
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=Fradurgo19.$  # O contraseña de aplicación
EMAIL_TO=fherrera@partequipos.com
```

---

## ✉️ Funcionamiento del Sistema

### Cuando se Crea una Factura:

1. **Usuario crea factura** en `/new-bill`
2. **Sistema guarda** la factura en la base de datos
3. **Sistema envía correo automático** a:
   - **Destinatario principal:** fherrera@partequipos.com
   - **Copia (CC):** Correo del usuario que creó la factura

### Contenido del Correo:

✅ **Asunto:** 
```
Nueva Factura Registrada - FAC-001 - Electricidad
```

✅ **Cuerpo HTML con:**
- Título con diseño profesional
- Todos los datos de la factura
- Monto destacado
- Estado de la factura
- Datos del usuario que la creó
- Botón para ver en el sistema

✅ **Adjunto:**
- Archivo PDF, JPG o PNG de la factura (si existe)

---

## 🎨 Ejemplo de Correo

```
┌─────────────────────────────────────────────────────────────┐
│             📄 Nueva Factura Registrada                     │
│           Sistema de Gestión de Facturas                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Se ha registrado una nueva factura por María García.       │
│                                                              │
│  📋 Detalles de la Factura                                  │
│  ─────────────────────────────────────────────────────────  │
│  Tipo de Servicio:    Electricidad                         │
│  Proveedor:           CODENSA                               │
│  Número de Factura:   FAC-001                               │
│  Periodo:             2025-10                               │
│  Monto Total:         $ 10,987,634                          │
│  Fecha Vencimiento:   23 de octubre de 2025                │
│  Ubicación:           Cali                                  │
│  Estado:              Pendiente                             │
│                                                              │
│  Registrado por: María García (maria@ejemplo.com)          │
│  Fecha de registro: 20 de octubre de 2025                  │
│                                                              │
│                   [Ver en el Sistema]                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Probar el Sistema

### 1. Configurar Variables de Entorno

Asegúrate de tener `.env` configurado:

```bash
# Verifica que existe
ls .env

# Si no existe, cópialo del ejemplo
cp env.example.local .env

# Edita y agrega las credenciales de correo
notepad .env
```

### 2. Reiniciar el Servidor

El servidor debe detectar la configuración de correo:

```bash
npm run dev:backend
```

Deberías ver:
```
🚀 Servidor backend ejecutándose en http://localhost:3000
📊 Base de datos: PostgreSQL Local
🔐 Autenticación: JWT
✅ Servidor de correo configurado correctamente
```

### 3. Crear una Factura de Prueba

1. Ve a: http://localhost:5173/new-bill
2. Completa el formulario
3. Sube un archivo (opcional)
4. Click en "Enviar Factura"

### 4. Verificar los Correos

Deberías recibir correos en:
- ✅ fherrera@partequipos.com (destinatario principal)
- ✅ Correo del usuario que creó la factura (copia)

---

## 🔍 Logs del Sistema

Cuando se envía un correo, verás en la consola del backend:

```bash
📝 Datos recibidos para crear factura: {...}
✅ Factura creada en BD: {...}
📧 Correo enviado a fherrera@partequipos.com y usuario@ejemplo.com
```

Si hay errores:
```bash
❌ Error al enviar correo: [mensaje de error]
```

---

## ⚙️ Configuración Avanzada

### Cambiar Servidor SMTP

Si no quieres usar Gmail, puedes cambiar en `backend/emailService.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',  // Para Outlook
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Cambiar Destinatario Principal

Edita en `.env`:

```env
EMAIL_TO=otro@ejemplo.com
```

---

## 🛡️ Seguridad

⚠️ **NUNCA subas el archivo `.env` a GitHub**

El archivo `.env` está en `.gitignore` por seguridad.

**Contiene:**
- Contraseñas de base de datos
- Contraseñas de correo
- Claves secretas

---

## 📊 Datos Incluidos en el Correo

El correo incluye automáticamente:

| Campo                | Fuente                    |
|----------------------|---------------------------|
| Tipo de Servicio     | Formulario                |
| Proveedor            | Formulario                |
| Número de Factura    | Formulario                |
| Periodo              | Formulario                |
| Monto Total          | Formulario (destacado)    |
| Fecha de Vencimiento | Formulario                |
| Ubicación            | Formulario                |
| Centro de Costos     | Formulario                |
| Estado               | Automático (Pendiente)    |
| Consumo              | Formulario (si aplica)    |
| Notas                | Formulario (si hay)       |
| Usuario que registró | Base de datos             |
| Archivo adjunto      | Upload (si existe)        |

---

## ✅ Checklist de Configuración

- [ ] Nodemailer instalado (`npm install nodemailer`)
- [ ] Archivo `.env` creado y configurado
- [ ] Contraseña de aplicación de Gmail generada
- [ ] Variables EMAIL_USER, EMAIL_PASSWORD, EMAIL_TO configuradas
- [ ] Servidor reiniciado
- [ ] Mensaje "✅ Servidor de correo configurado correctamente" visible

---

## 🆘 Solución de Problemas

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solución:**
- Genera una contraseña de aplicación de Gmail
- Actualiza EMAIL_PASSWORD en `.env`

### Error: "Connection timeout"

**Solución:**
- Verifica tu conexión a internet
- Verifica que el puerto 587 no esté bloqueado
- Intenta con port: 465 y secure: true

### Los correos no llegan

**Verifica:**
1. Revisa la carpeta de spam/correo no deseado
2. Verifica que EMAIL_TO esté correcto
3. Revisa los logs del servidor backend

### El adjunto no llega

**Verifica:**
1. Que el archivo se haya subido correctamente
2. Que la ruta del archivo sea correcta
3. Revisa los logs para ver si hay errores

---

## 📝 Notas Técnicas

- **No bloqueante:** El envío de correo no bloquea la creación de la factura
- **Asíncrono:** Si el correo falla, la factura se crea igual
- **Logs completos:** Todos los intentos de envío se registran en consola
- **Adjuntos automáticos:** Si hay documento, se adjunta automáticamente
- **HTML responsive:** El correo se ve bien en móvil y desktop

---

## 🎯 Próximos Pasos

1. Configura las variables de entorno
2. Reinicia el servidor backend
3. Crea una factura de prueba
4. Verifica que llegue el correo
5. ¡Listo!

---

**Documentación creada:** $(Get-Date -Format "dd/MM/yyyy HH:mm")

