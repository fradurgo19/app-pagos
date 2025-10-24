# Cambios Realizados: Campo "Número de Contrato"

## Resumen
Se ha agregado el campo "Número de Contrato" (contract_number) al sistema de facturas en todas las capas: base de datos, backend y frontend.

## Archivos Modificados

### 1. Base de Datos

#### `supabase/migrations/20250115000000_add_contract_number.sql` (NUEVO)
- Creación de migración para agregar la columna `contract_number` a la tabla `utility_bills`

#### `supabase/migrations/20251001212345_create_utility_bills_schema.sql`
- Agregada columna `contract_number TEXT` en la creación de la tabla `utility_bills` (línea 102)

#### `database/setup-local-postgres.sql`
- Agregada columna `contract_number TEXT` en la definición de la tabla `utility_bills` (línea 51)

### 2. Frontend - TypeScript Types

#### `src/types/index.ts`
- Agregado campo `contractNumber?: string` en la interfaz `UtilityBill` (línea 20)
- Agregado campo `contractNumber: string` en la interfaz `UtilityBillFormData` (línea 44)

#### `src/lib/supabase.ts`
- Agregado campo `contract_number: string | null` en la interfaz de base de datos:
  - En `Row` (línea 58)
  - En `Insert` (línea 82)
  - En `Update` (línea 101)

### 3. Frontend - Componentes

#### `src/organisms/BillForm.tsx`
- Agregado campo `contractNumber: ''` en `initialFormData` (línea 23)
- Agregado campo de entrada para "Número de Contrato" en el formulario (líneas 333-339)
- Agregado `contractNumber: formData.contractNumber` en el objeto `billData` al enviar (línea 268)

#### `src/organisms/BillsTable.tsx`
- Agregada columna "N° Contrato" en el encabezado de la tabla después de "Proveedor" (líneas 184-186)
- Agregada celda para mostrar `contractNumber` en cada fila de la tabla (líneas 241-243)
- Actualizado `colSpan` en el mensaje de "No se encontraron facturas" de 9 a 10 (línea 216)
- Actualizado `colSpan` en la fila de totales de 4 a 5 (línea 311)

#### `src/pages/ReportsPage.tsx`
- Agregado "N° Contrato" en los encabezados del CSV export (línea 163)
- Agregado `bill.contractNumber || ''` en los datos del CSV export (línea 168)
- Agregada columna "N° Contrato" en la vista de facturas después de "Proveedor" (líneas 382-385)
- Actualizado grid de columnas de `md:grid-cols-6` a `md:grid-cols-7` para admin y de `md:grid-cols-5` a `md:grid-cols-6` para usuarios (línea 357)

### 4. Backend

#### `backend/server.js`
- Agregado campo `contractNumber: row.contract_number` en la función `transformBillToFrontend` (línea 86)
- Agregado `contractNumber: bill.contractNumber || bill.contract_number` en la normalización de datos (línea 420)
- Agregado `contract_number: normalizedBill.contractNumber` en el INSERT de facturas (línea 446)
- Agregado `contract_number = COALESCE($7, contract_number)` en el UPDATE de facturas (línea 524)
- Agregado `updates.contractNumber` en los parámetros del UPDATE (línea 546)

## Ubicación del Campo en las Tablas

### Tabla de Facturas (/bills)
La columna "N° Contrato" aparece después de "Proveedor" y antes de "Monto".

Orden de columnas:
1. Checkbox
2. Período
3. Servicio
4. Proveedor
5. **N° Contrato** ← NUEVO
6. Monto
7. Vencimiento
8. Ubicación
9. Estado
10. Acciones

### Tabla de Reportes (/reports)
La columna "N° Contrato" aparece después de "Proveedor" y antes de "N° Factura".

Orden de columnas:
1. Usuario (solo admin)
2. Tipo de Servicio
3. Proveedor
4. **N° Contrato** ← NUEVO
5. N° Factura
6. Monto
7. Estado

## Formulario de Nueva Factura
El campo "Número de Contrato" aparece en la sección "Información de la Factura", después del campo "Número de Factura" y antes de "Descripción".

## Próximos Pasos

1. **Ejecutar la migración en producción:**
   ```sql
   ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS contract_number TEXT;
   ```

2. **Si usa PostgreSQL local:** El campo ya está incluido en el script de setup.

3. **Verificar que el backend esté desplegado** con los cambios incluidos.

4. **Probar la funcionalidad:**
   - Crear una nueva factura con número de contrato
   - Verificar que aparece en las tablas de facturas y reportes
   - Verificar que se exporta correctamente en CSV

## Notas

- El campo es opcional (puede estar vacío)
- Los valores vacíos se muestran como "-" en las tablas
- El campo es compatible con ambos estilos de nomenclatura (camelCase y snake_case)
- No se requieren cambios en las validaciones existentes

