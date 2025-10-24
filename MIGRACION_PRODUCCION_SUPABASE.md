# 🚀 Migración a Producción - Supabase

## Importante: Ejecutar Migración en Producción

El proyecto está en producción usando **Supabase**. Necesitas ejecutar la migración directamente en la base de datos de producción.

## Proyecto Supabase
- **URL**: https://rafmynmmenebreqeagvm.supabase.co
- **Ref**: rafmynmmenebreqeagvm

---

## 📋 Opción 1: Usando SQL Editor de Supabase (RECOMENDADO)

### Paso 1: Acceder al Dashboard
1. Ve a https://app.supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto **rafmynmmenebreqeagvm**

### Paso 2: Abrir SQL Editor
1. En el menú lateral, haz clic en **SQL Editor**
2. Haz clic en **New query**

### Paso 3: Ejecutar la Migración
Copia y pega el siguiente SQL:

```sql
-- Migration: Add contract_number column to utility_bills table
-- Date: 2025-01-15

-- Add contract_number column to utility_bills table
ALTER TABLE utility_bills ADD COLUMN IF NOT EXISTS contract_number TEXT;

-- Add comment to the column
COMMENT ON COLUMN utility_bills.contract_number IS 'Número de contrato asociado a la factura';
```

### Paso 4: Ejecutar
1. Haz clic en el botón **Run** (o presiona Ctrl+Enter)
2. Deberías ver el mensaje: `Success. No rows returned`

### Paso 5: Verificar
Ejecuta esta consulta para verificar:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'utility_bills' 
AND column_name = 'contract_number';
```

Deberías ver:
```
column_name     | data_type | is_nullable
----------------+-----------+------------
contract_number | text      | YES
```

---

## 📋 Opción 2: Usando Supabase CLI

Si tienes el CLI de Supabase instalado, puedes usar:

### Instalar Supabase CLI (si no lo tienes)
```bash
npm install -g supabase
```

### Aplicar Migración
```bash
# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref rafmynmmenebreqeagvm

# Aplicar migraciones pendientes
supabase db push
```

---

## ⚠️ IMPORTANTE: Desplegar el Código

Después de ejecutar la migración en la base de datos, **DEBES** desplegar el código actualizado:

### Opción A: Despliegue Automático con Git (Vercel)
Si tienes configuración automática con Vercel:

```bash
# Hacer commit de los cambios
git add .
git commit -m "feat: Add contract_number field to invoices"
git push origin main
```

Vercel desplegará automáticamente los cambios.

### Opción B: Despliegue Manual

1. **Construir el proyecto**:
   ```bash
   npm run build
   ```

2. **Desplegar en Vercel**:
   ```bash
   # Opción 1: Usando Vercel CLI
   vercel --prod
   
   # Opción 2: Desde el dashboard de Vercel
   # Ve a tu proyecto en Vercel y haz "Redeploy"
   ```

---

## 📝 Checklist de Migración

- [ ] Ejecutar migración SQL en Supabase (Opción 1 o 2)
- [ ] Verificar que la columna fue creada
- [ ] Hacer commit de los cambios del código
- [ ] Hacer push a Git
- [ ] Verificar que Vercel desplegó automáticamente
- [ ] Probar la funcionalidad en producción
- [ ] Verificar que el campo aparece en el formulario
- [ ] Verificar que el campo aparece en las tablas

---

## 🧪 Probar en Producción

Una vez desplegado:

1. Ve a https://app-pagos-rho.vercel.app
2. Inicia sesión
3. Ve a "Nueva Factura"
4. Verifica que aparece el campo "Número de Contrato"
5. Crea una factura de prueba con número de contrato
6. Ve a la tabla de facturas y verifica que aparece la columna "N° Contrato"
7. Ve a la tabla de reportes y verifica que aparece la columna "N° Contrato"

---

## 🔄 Rollback (Si algo sale mal)

Si necesitas revertir la migración:

```sql
ALTER TABLE utility_bills DROP COLUMN IF EXISTS contract_number;
```

**NOTA**: Solo ejecuta el rollback si es absolutamente necesario, ya que perderás todos los datos del campo contract_number.

---

## ✅ Confirmación

Una vez completada la migración en producción, marca esta tarea como completada en tu sistema de gestión de proyectos.

**Estado de la migración**: ⏳ Pendiente de ejecución en producción

