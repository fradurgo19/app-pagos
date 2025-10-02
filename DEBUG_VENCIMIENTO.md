# 🐛 Debug: Problema con Fecha de Vencimiento

## ❌ Problema

La fecha de vencimiento no se guarda o no se muestra en:
- ❌ Tabla de facturas (columna Vencimiento)
- ❌ Modal de detalles

---

## 🔍 Debugging

He agregado logging detallado en el backend. Ahora sigue estos pasos:

### Paso 1: Reiniciar Backend

En la terminal del backend:
1. **Presiona**: `Ctrl+C`
2. **Ejecuta**: `npm run dev:backend`

### Paso 2: Crear Factura de Prueba

1. Ve a: http://localhost:5173/new-bill
2. Llena el formulario:
   - Tipo: Electricidad
   - Proveedor: Codensa
   - Período: Mes actual
   - Monto: 100000
   - Monto Total: 100000
   - Ubicación: Oficina Bogotá
   - **FECHA DE VENCIMIENTO: (Elige una fecha)** ← IMPORTANTE
3. Click "Enviar Factura"

### Paso 3: Revisar Logs del Backend

En la terminal del backend verás algo como:

```json
📝 Datos recibidos para crear factura:
{
  "serviceType": "electricity",
  "provider": "Codensa",
  "dueDate": "2025-01-15",  ← DEBE APARECER AQUÍ
  ...
}

📝 Datos normalizados:
{
  "dueDate": "2025-01-15",  ← DEBE APARECER AQUÍ TAMBIÉN
  ...
}

✅ Factura creada en BD:
{
  "due_date": "2025-01-15",  ← DEBE APARECER AQUÍ
  ...
}
```

### Paso 4: Verificar en PostgreSQL

```sql
psql -U postgres -d apppagos

SELECT id, service_type, due_date, created_at 
FROM utility_bills 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🔧 Posibles Causas

1. **La fecha no se envía desde el formulario**
   - Solución: Verificar que el input date tiene valor

2. **El backend no recibe la fecha**
   - Solución: Ver logs del backend

3. **La fecha se guarda pero no se mapea al mostrar**
   - Solución: Revisar función mapDbRowToBill

4. **La fecha está en formato incorrecto**
   - Solución: Convertir formato

---

## ✅ Verificación

Copia y pega aquí lo que aparece en los logs del backend cuando creas la factura.

Específicamente busca:
- `dueDate` en "Datos recibidos"
- `dueDate` en "Datos normalizados"  
- `due_date` en "Factura creada en BD"

Si alguno está `undefined` o `null`, ahí está el problema.

