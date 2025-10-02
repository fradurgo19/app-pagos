# 📎 Sistema de Archivos Implementado

## ✅ Funcionalidad Completa de Upload/Download

---

## 🎯 **Lo que se Implementó:**

### Backend (Express + Multer)
- ✅ Endpoint **POST `/api/upload`** - Sube archivos
- ✅ Endpoint **GET `/uploads/:filename`** - Descarga archivos
- ✅ Directorio `backend/uploads/` creado automáticamente
- ✅ Validación de tipos de archivo (PDF, JPG, PNG)
- ✅ Límite de tamaño: 10MB
- ✅ Nombres únicos para evitar conflictos

### Frontend
- ✅ `BillForm` sube archivos antes de crear factura
- ✅ Botón de descarga funcional en la tabla
- ✅ Ícono de descarga en modal de detalles
- ✅ Componente `FileUpload` integrado

---

## 🚀 **Cómo Usar:**

### Paso 1: Reiniciar Backend

```powershell
# Terminal del backend:
Ctrl+C
npm run dev
```

Deberías ver:
```
📁 Directorio de uploads creado
🚀 Servidor backend ejecutándose en http://localhost:3000
```

### Paso 2: Probar Upload

1. **Ve a**: http://localhost:5173/new-bill
2. **Llena** el formulario normalmente
3. **En la sección "Documento y Notas"**:
   - Click en el área de upload
   - Selecciona un archivo (PDF, JPG o PNG)
   - ✅ Verás el nombre del archivo y tamaño
4. **Click** "Enviar Factura"
5. ✅ **Esperado**: Archivo se sube automáticamente

### Paso 3: Verificar en la Tabla

1. **Ve a**: http://localhost:5173/bills
2. **Busca** la factura que creaste
3. ✅ **Verifica**: Ícono de descarga (📥) aparece
4. **Click** en el ícono de descarga
5. ✅ **Esperado**: Archivo se descarga

### Paso 4: Ver en Modal de Detalles

1. **Click** en el ojo (👁️) de la factura
2. ✅ **Verifica**: Sección "Documento Adjunto" aparece
3. **Click** en el ícono de descarga del modal
4. ✅ **Esperado**: Archivo se descarga

---

## 📁 **Estructura de Archivos:**

```
backend/
├── server.js           # Endpoints de upload/download
├── uploads/            # ← Archivos subidos aquí
│   ├── 1728000000-abc123-factura.pdf
│   ├── 1728000001-def456-recibo.jpg
│   └── ...
└── .gitignore         # uploads/ está ignorado
```

---

## 🔒 **Seguridad Implementada:**

- ✅ **Autenticación requerida**: Solo usuarios autenticados pueden subir/descargar
- ✅ **Validación de tipos**: Solo PDF, JPG, PNG
- ✅ **Límite de tamaño**: 10MB máximo
- ✅ **Nombres únicos**: Previene sobrescritura
- ✅ **Extensión verificada**: No se puede engañar cambiando extensión

---

## 🧪 **Pruebas a Realizar:**

### Upload
- [ ] Subir archivo PDF (< 10MB)
- [ ] Subir imagen JPG (< 10MB)
- [ ] Subir imagen PNG (< 10MB)
- [ ] Intentar subir archivo .exe o .zip
- [ ] ✅ **Esperado**: Rechazado
- [ ] Intentar subir archivo > 10MB
- [ ] ✅ **Esperado**: Error de tamaño

### Download
- [ ] Click en ícono de descarga en tabla
- [ ] ✅ **Esperado**: Archivo se descarga
- [ ] Click en descarga desde modal
- [ ] ✅ **Esperado**: Archivo se descarga
- [ ] Verificar que el archivo descargado abre correctamente

### Sin Archivo
- [ ] Crear factura SIN adjuntar archivo
- [ ] ✅ **Esperado**: Factura se crea normalmente
- [ ] ✅ **Verificar**: NO aparece ícono de descarga

---

## 📝 **Flujo Completo:**

```
1. Usuario selecciona archivo en formulario
   ↓
2. Click "Enviar Factura"
   ↓
3. Frontend → POST /api/upload con archivo
   ↓
4. Backend guarda en uploads/ y retorna URL
   ↓
5. Frontend recibe URL
   ↓
6. Frontend → POST /api/bills con documentUrl
   ↓
7. Backend guarda factura con URL del documento
   ↓
8. En la tabla, aparece ícono de descarga
   ↓
9. Click en descarga → archivo se descarga
```

---

## 🗂️ **Tipos de Archivo Soportados:**

| Tipo | Extensión | MIME Type | Tamaño Máximo |
|------|-----------|-----------|---------------|
| PDF | .pdf | application/pdf | 10MB |
| JPEG | .jpg, .jpeg | image/jpeg | 10MB |
| PNG | .png | image/png | 10MB |

---

## 🔍 **Verificar en el Sistema:**

### Ver archivos subidos:
```powershell
# Ver directorio de uploads
Get-ChildItem backend\uploads
```

### Ver en la base de datos:
```sql
psql -U postgres -d apppagos

SELECT 
  invoice_number,
  document_name,
  document_url
FROM utility_bills
WHERE document_url IS NOT NULL
ORDER BY created_at DESC;
```

---

## 🌐 **Para Producción (Futuro):**

Cuando migres a Supabase Storage:

1. Crear bucket en Supabase
2. Cambiar `backend/server.js` para usar Supabase Storage API
3. Los archivos se guardarán en la nube
4. URLs serán de Supabase

**Por ahora en desarrollo**: Archivos se guardan en `backend/uploads/`

---

## ⚠️ **Importante:**

- 📁 El directorio `uploads/` NO se sube a Git (está en .gitignore)
- 💾 En producción, usa Supabase Storage
- 🔒 Solo usuarios autenticados pueden subir/descargar
- 🗑️ Los archivos NO se eliminan automáticamente si borras la factura

---

## 🎯 **Prueba Ahora:**

1. **Reinicia** el backend:
   ```powershell
   Ctrl+C (en terminal del backend)
   cd ..
   npm run dev:backend
   ```

2. **Crea** una factura con un archivo PDF o imagen

3. **Verifica** que se puede descargar desde:
   - La tabla (ícono 📥)
   - El modal de detalles

---

**Reinicia el backend y prueba subir un archivo!** 📎✨

